"""
API REST del ERP Famoc (módulo Comercial) con autenticación y permisos.

Autenticación: sesión de Django. Las escrituras exigen protección CSRF: el
frontend obtiene la cookie csrftoken con GET /api/sesion/ y la envía en la
cabecera X-CSRFToken.

Endpoints (prefijo /api/):
  GET            sesion/             estado de la sesión actual (público)
  POST           login/              iniciar sesión (público)
  POST           logout/             cerrar sesión
  GET/POST       clientes/
  DELETE         clientes/<id>/
  GET            muebles/
  GET/POST       cotizaciones/
  GET            bitacora/           actividad registrada (solo administradores)
  GET            inventario/         existencias por mueble y sede
  GET/POST       movimientos/        movimientos de inventario (entradas, salidas, ajustes)

Los permisos son los de Django (app famocapp): view_, add_, change_, delete_.
Se asignan por roles (grupos) con el comando `configurar_roles`.
"""

import functools
import json

from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.db.models import ProtectedError
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import (
    Bitacora,
    Cliente,
    Cotizacion,
    CotizacionItem,
    Existencia,
    Mueble,
    MovimientoInventario,
    Sede,
)
from .serializers import (
    bitacora_a_dict,
    cliente_a_dict,
    cotizacion_a_dict,
    existencia_a_dict,
    movimiento_a_dict,
    mueble_a_dict,
    sesion_a_dict,
)

MAX_NOMBRE = 150
MAX_TELEFONO = 30


class ApiError(Exception):
    def __init__(self, mensaje, status=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status = status


def api_view(permisos, publica=False):
    """
    Decorador de endpoints.

    permisos: dict {METODO: "famocapp.codename" o None}. Un método sin permiso
              (None) solo exige sesión iniciada.
    publica:  si es True, no exige sesión (login, sesión, logout).
    """

    def decorador(vista):
        @functools.wraps(vista)
        def envoltura(request, *args, **kwargs):
            if request.method not in permisos:
                return JsonResponse({"error": "Método no permitido."}, status=405)

            if not publica:
                if not request.user.is_authenticated:
                    return JsonResponse({"error": "Debes iniciar sesión."}, status=401)
                permiso = permisos[request.method]
                if permiso and not request.user.has_perm(permiso):
                    return JsonResponse(
                        {"error": "No tienes permiso para realizar esta acción."}, status=403
                    )

            try:
                return vista(request, *args, **kwargs)
            except ApiError as exc:
                return JsonResponse({"error": exc.mensaje}, status=exc.status)

        return envoltura

    return decorador


def _leer_json(request):
    try:
        datos = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        raise ApiError("El cuerpo de la petición no es JSON válido.")
    if not isinstance(datos, dict):
        raise ApiError("Se esperaba un objeto JSON.")
    return datos


def _texto(valor):
    return str(valor or "").strip()


def _buscar(queryset, pk):
    """Devuelve el objeto con ese pk o None, sin fallar si el pk no es válido."""
    try:
        return queryset.filter(pk=pk).first()
    except (ValueError, TypeError):
        return None


def _registrar(usuario, accion, entidad, entidad_id=None, detalle=""):
    Bitacora.objects.create(
        usuario=usuario if usuario and usuario.is_authenticated else None,
        accion=accion,
        entidad=entidad,
        entidad_id=entidad_id,
        detalle=detalle,
    )


def _consulta_cotizaciones():
    return Cotizacion.objects.select_related("cliente", "creado_por").prefetch_related("items__mueble")


# --- Sesión ----------------------------------------------------------------

@ensure_csrf_cookie
@api_view({"GET": None}, publica=True)
def sesion(request):
    return JsonResponse(sesion_a_dict(request.user))


@api_view({"POST": None}, publica=True)
def iniciar_sesion(request):
    datos = _leer_json(request)
    nombre_usuario = _texto(datos.get("usuario"))
    clave = str(datos.get("clave") or "")

    usuario = authenticate(request, username=nombre_usuario, password=clave)
    if usuario is None or not usuario.is_active:
        _registrar(None, "login_fallido", "Sesión", detalle=f"Usuario intentado: {nombre_usuario}")
        raise ApiError("Usuario o contraseña incorrectos.", status=401)

    login(request, usuario)
    _registrar(usuario, "login", "Sesión")
    return JsonResponse(sesion_a_dict(usuario))


@api_view({"POST": None}, publica=True)
def cerrar_sesion(request):
    if request.user.is_authenticated:
        _registrar(request.user, "logout", "Sesión")
    logout(request)
    return JsonResponse({"autenticado": False, "permisos": [], "roles": []})


# --- Clientes --------------------------------------------------------------

@api_view({"GET": "famocapp.view_cliente", "POST": "famocapp.add_cliente"})
def clientes(request):
    if request.method == "GET":
        return JsonResponse([cliente_a_dict(c) for c in Cliente.objects.all()], safe=False)

    datos = _leer_json(request)
    nombre = _texto(datos.get("nombre"))
    telefono = _texto(datos.get("telefono"))
    ciudad = _texto(datos.get("ciudad"))

    if not nombre:
        raise ApiError("El nombre del cliente es obligatorio.")
    if len(nombre) > MAX_NOMBRE:
        raise ApiError(f"El nombre no puede tener más de {MAX_NOMBRE} caracteres.")
    if len(telefono) > MAX_TELEFONO:
        raise ApiError(f"El teléfono no puede tener más de {MAX_TELEFONO} caracteres.")
    if ciudad and ciudad not in Sede.values:
        raise ApiError("La sede seleccionada no es válida.")

    cliente = Cliente.objects.create(
        nombre=nombre, telefono=telefono, ciudad=ciudad, creado_por=request.user
    )
    _registrar(request.user, "cliente_creado", "Cliente", cliente.id, cliente.nombre)
    return JsonResponse(cliente_a_dict(cliente), status=201)


@api_view({"DELETE": "famocapp.delete_cliente"})
def cliente_detalle(request, pk):
    cliente = _buscar(Cliente.objects.all(), pk)
    if cliente is None:
        raise ApiError("Cliente no encontrado.", status=404)

    nombre = cliente.nombre
    try:
        cliente.delete()
    except ProtectedError:
        raise ApiError(
            "No se puede eliminar el cliente porque tiene cotizaciones registradas.",
            status=409,
        )
    _registrar(request.user, "cliente_eliminado", "Cliente", pk, nombre)
    return JsonResponse({"ok": True})


# --- Catálogo --------------------------------------------------------------

@api_view({"GET": "famocapp.view_mueble"})
def muebles(request):
    catalogo = Mueble.objects.filter(activo=True)
    return JsonResponse([mueble_a_dict(m) for m in catalogo], safe=False)


# --- Cotizaciones ----------------------------------------------------------

@api_view({"GET": "famocapp.view_cotizacion", "POST": "famocapp.add_cotizacion"})
def cotizaciones(request):
    if request.method == "GET":
        return JsonResponse(
            [cotizacion_a_dict(c) for c in _consulta_cotizaciones()], safe=False
        )

    datos = _leer_json(request)

    cliente = _buscar(Cliente.objects.all(), datos.get("cliente_id"))
    if cliente is None:
        raise ApiError("El cliente seleccionado no existe.")

    items = datos.get("items")
    if not isinstance(items, list) or not items:
        raise ApiError("La cotización debe incluir al menos un mueble.")

    lineas = []
    for linea in items:
        if not isinstance(linea, dict):
            raise ApiError("Cada ítem de la cotización debe ser un objeto.")
        try:
            cantidad = int(linea.get("cantidad", 1))
        except (TypeError, ValueError):
            raise ApiError("La cantidad debe ser un número entero.")
        if cantidad < 1:
            raise ApiError("La cantidad debe ser de al menos 1.")

        mueble = _buscar(Mueble.objects.filter(activo=True), linea.get("mueble_id"))
        if mueble is None:
            raise ApiError("Uno de los muebles no existe o ya no está disponible.")
        lineas.append((mueble, cantidad))

    # El total y los precios se calculan en el servidor, nunca se confían al cliente.
    with transaction.atomic():
        cotizacion = Cotizacion.objects.create(cliente=cliente, total=0, creado_por=request.user)
        total = 0
        for mueble, cantidad in lineas:
            CotizacionItem.objects.create(
                cotizacion=cotizacion,
                mueble=mueble,
                cantidad=cantidad,
                precio_unitario=mueble.precio,
            )
            total += mueble.precio * cantidad
        cotizacion.total = total
        cotizacion.save(update_fields=["total"])
        _registrar(
            request.user,
            "cotizacion_creada",
            "Cotización",
            cotizacion.id,
            f"Cliente: {cliente.nombre}; total: {total} COP",
        )

    cotizacion = _consulta_cotizaciones().get(pk=cotizacion.pk)
    return JsonResponse(cotizacion_a_dict(cotizacion), status=201)


# --- Bitácora --------------------------------------------------------------

@api_view({"GET": "famocapp.view_bitacora"})
def bitacora(request):
    registros = Bitacora.objects.select_related("usuario")[:200]
    return JsonResponse([bitacora_a_dict(r) for r in registros], safe=False)


# --- Inventario ------------------------------------------------------------

TipoMovimiento = MovimientoInventario.Tipo


def _aplicar_movimiento(usuario, mueble, sede, tipo, delta, motivo):
    """Aplica un movimiento de stock de forma atómica. Nunca deja el stock en negativo."""
    with transaction.atomic():
        existencia, _ = Existencia.objects.get_or_create(
            mueble=mueble, sede=sede, defaults={"cantidad": 0}
        )
        # Bloquea la fila para que dos movimientos simultáneos no lean el mismo saldo.
        existencia = Existencia.objects.select_for_update().get(pk=existencia.pk)

        saldo = existencia.cantidad + delta
        if saldo < 0:
            raise ApiError(
                f"Stock insuficiente en {sede}: hay {existencia.cantidad} unidades de {mueble.nombre}."
            )

        existencia.cantidad = saldo
        existencia.save(update_fields=["cantidad"])
        movimiento = MovimientoInventario.objects.create(
            mueble=mueble,
            sede=sede,
            tipo=tipo,
            delta=delta,
            saldo=saldo,
            motivo=motivo,
            usuario=usuario,
        )
        _registrar(
            usuario,
            "movimiento_inventario",
            "Inventario",
            movimiento.id,
            f"{tipo} de {delta:+d} x {mueble.nombre} en {sede}; saldo: {saldo}",
        )
    return movimiento, existencia


@api_view({"GET": "famocapp.view_existencia"})
def inventario(request):
    existencias = Existencia.objects.select_related("mueble")
    sede = request.GET.get("sede", "")
    if sede:
        if sede not in Sede.values:
            raise ApiError("La sede seleccionada no es válida.")
        existencias = existencias.filter(sede=sede)
    return JsonResponse([existencia_a_dict(e) for e in existencias], safe=False)


@api_view({"GET": "famocapp.view_movimientoinventario", "POST": "famocapp.add_movimientoinventario"})
def movimientos(request):
    if request.method == "GET":
        registros = MovimientoInventario.objects.select_related("mueble", "usuario")[:200]
        return JsonResponse([movimiento_a_dict(m) for m in registros], safe=False)

    datos = _leer_json(request)

    mueble = _buscar(Mueble.objects.filter(activo=True), datos.get("mueble_id"))
    if mueble is None:
        raise ApiError("El mueble seleccionado no existe o no está disponible.")

    sede = _texto(datos.get("sede"))
    if sede not in Sede.values:
        raise ApiError("La sede seleccionada no es válida.")

    tipo = _texto(datos.get("tipo"))
    if tipo not in TipoMovimiento.values:
        raise ApiError("El tipo de movimiento no es válido.")

    try:
        cantidad = int(datos.get("cantidad"))
    except (TypeError, ValueError):
        raise ApiError("La cantidad debe ser un número entero.")

    motivo = _texto(datos.get("motivo"))[:200]

    if tipo == TipoMovimiento.AJUSTE:
        if cantidad == 0:
            raise ApiError("El ajuste no puede ser cero.")
        if not motivo:
            raise ApiError("Los ajustes requieren un motivo.")
        delta = cantidad
    else:
        if cantidad <= 0:
            raise ApiError("La cantidad debe ser mayor que cero.")
        delta = cantidad if tipo == TipoMovimiento.ENTRADA else -cantidad

    movimiento, existencia = _aplicar_movimiento(request.user, mueble, sede, tipo, delta, motivo)
    movimiento = MovimientoInventario.objects.select_related("mueble", "usuario").get(pk=movimiento.pk)
    return JsonResponse(
        {
            "movimiento": movimiento_a_dict(movimiento),
            "existencia": existencia_a_dict(existencia),
        },
        status=201,
    )
