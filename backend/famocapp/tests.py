import json

from django.contrib.auth.models import Group, User
from django.core.management import call_command
from django.test import Client, TestCase

from .models import Bitacora, Cliente, Cotizacion, Existencia, Mueble, MovimientoInventario

PASSWORD = "Clave-segura-2026"


class _ApiTestCase(TestCase):
    def setUp(self):
        call_command("configurar_roles", verbosity=0)

    def crear_usuario(self, rol, nombre):
        usuario = User.objects.create_user(username=nombre, password=PASSWORD)
        usuario.groups.add(Group.objects.get(name=rol))
        return usuario

    def entrar_como(self, rol, nombre):
        usuario = self.crear_usuario(rol, nombre)
        self.client.force_login(usuario)
        return usuario

    def _post(self, url, datos, cliente=None):
        cliente = cliente or self.client
        return cliente.post(url, data=json.dumps(datos), content_type="application/json")


class ClientesApiTests(_ApiTestCase):
    def setUp(self):
        super().setUp()
        self.comercial = self.entrar_como("Comercial", "comercial")

    def test_crear_y_listar_cliente(self):
        r = self._post("/api/clientes/", {"nombre": "Ana Pérez", "telefono": "300", "ciudad": "Bogotá"})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["nombre"], "Ana Pérez")
        self.assertEqual(Cliente.objects.get().creado_por, self.comercial)

        r = self.client.get("/api/clientes/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(r.json()), 1)

    def test_nombre_obligatorio(self):
        r = self._post("/api/clientes/", {"nombre": "   "})
        self.assertEqual(r.status_code, 400)

    def test_ciudad_debe_ser_una_sede(self):
        r = self._post("/api/clientes/", {"nombre": "Ana", "ciudad": "Cali"})
        self.assertEqual(r.status_code, 400)

    def test_json_invalido(self):
        r = self.client.post("/api/clientes/", data="{no es json", content_type="application/json")
        self.assertEqual(r.status_code, 400)

    def test_comercial_no_puede_eliminar_clientes(self):
        cliente = Cliente.objects.create(nombre="Luis")
        r = self.client.delete(f"/api/clientes/{cliente.id}/")
        self.assertEqual(r.status_code, 403)
        self.assertTrue(Cliente.objects.filter(pk=cliente.id).exists())

    def test_eliminar_cliente_con_cotizaciones_devuelve_409(self):
        mueble = Mueble.objects.create(nombre="Silla", categoria="Sillas", precio=100)
        cliente = Cliente.objects.create(nombre="Luis")
        self._post(
            "/api/cotizaciones/",
            {"cliente_id": cliente.id, "items": [{"mueble_id": mueble.id, "cantidad": 1}]},
        )
        self.entrar_como("Administrador", "admin")
        r = self.client.delete(f"/api/clientes/{cliente.id}/")
        self.assertEqual(r.status_code, 409)
        self.assertTrue(Cliente.objects.filter(pk=cliente.id).exists())

    def test_administrador_elimina_cliente_sin_cotizaciones(self):
        self.entrar_como("Administrador", "admin")
        cliente = Cliente.objects.create(nombre="Marta")
        r = self.client.delete(f"/api/clientes/{cliente.id}/")
        self.assertEqual(r.status_code, 200)
        self.assertFalse(Cliente.objects.filter(pk=cliente.id).exists())


class AutenticacionTests(_ApiTestCase):
    def test_sin_sesion_los_endpoints_responden_401(self):
        self.assertEqual(self.client.get("/api/clientes/").status_code, 401)
        self.assertEqual(self.client.get("/api/cotizaciones/").status_code, 401)
        self.assertEqual(self.client.get("/api/muebles/").status_code, 401)

    def test_sesion_sin_login_no_esta_autenticada(self):
        r = self.client.get("/api/sesion/")
        self.assertEqual(r.status_code, 200)
        self.assertFalse(r.json()["autenticado"])

    def test_login_correcto_devuelve_roles_y_permisos(self):
        self.crear_usuario("Comercial", "ana")
        r = self.client.post(
            "/api/login/",
            data=json.dumps({"usuario": "ana", "clave": PASSWORD}),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200)
        datos = r.json()
        self.assertTrue(datos["autenticado"])
        self.assertIn("Comercial", datos["roles"])
        self.assertIn("famocapp.add_cliente", datos["permisos"])

    def test_login_incorrecto_responde_401(self):
        self.crear_usuario("Comercial", "ana")
        r = self.client.post(
            "/api/login/",
            data=json.dumps({"usuario": "ana", "clave": "otra"}),
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 401)
        self.assertTrue(Bitacora.objects.filter(accion="login_fallido").exists())

    def test_logout_cierra_la_sesion(self):
        self.entrar_como("Comercial", "ana")
        r = self.client.post("/api/logout/")
        self.assertEqual(r.status_code, 200)
        self.assertFalse(self.client.get("/api/sesion/").json()["autenticado"])

    def test_consulta_no_puede_crear_clientes(self):
        self.entrar_como("Consulta", "consulta")
        r = self._post("/api/clientes/", {"nombre": "Ana"})
        self.assertEqual(r.status_code, 403)

    def test_consulta_puede_ver_muebles(self):
        self.entrar_como("Consulta", "consulta")
        self.assertEqual(self.client.get("/api/muebles/").status_code, 200)

    def test_post_sin_token_csrf_es_rechazado(self):
        cliente = Client(enforce_csrf_checks=True)
        cliente.force_login(self.crear_usuario("Comercial", "sin_csrf"))
        r = self._post("/api/clientes/", {"nombre": "Ana"}, cliente=cliente)
        self.assertEqual(r.status_code, 403)
        self.assertFalse(Cliente.objects.exists())

    def test_bitacora_solo_para_administradores(self):
        self.entrar_como("Comercial", "ana")
        self.assertEqual(self.client.get("/api/bitacora/").status_code, 403)

        self.entrar_como("Administrador", "admin")
        self.assertEqual(self.client.get("/api/bitacora/").status_code, 200)

    def test_bitacora_registra_altas(self):
        self.entrar_como("Comercial", "ana")
        self._post("/api/clientes/", {"nombre": "Ana"})

        self.entrar_como("Administrador", "admin")
        acciones = [r["accion"] for r in self.client.get("/api/bitacora/").json()]
        self.assertIn("cliente_creado", acciones)


class MueblesApiTests(_ApiTestCase):
    def setUp(self):
        super().setUp()
        self.entrar_como("Consulta", "consulta")

    def test_solo_muestra_muebles_activos(self):
        Mueble.objects.create(nombre="Activo", categoria="Sillas", precio=10)
        Mueble.objects.create(nombre="Inactivo", categoria="Sillas", precio=10, activo=False)
        r = self.client.get("/api/muebles/")
        nombres = [m["nombre"] for m in r.json()]
        self.assertEqual(nombres, ["Activo"])


class CotizacionesApiTests(_ApiTestCase):
    def setUp(self):
        super().setUp()
        self.comercial = self.entrar_como("Comercial", "comercial")
        self.cliente = Cliente.objects.create(nombre="Carlos")
        self.escritorio = Mueble.objects.create(nombre="Escritorio", categoria="Escritorios", precio=1000)
        self.silla = Mueble.objects.create(nombre="Silla", categoria="Sillas", precio=500)

    def test_total_se_calcula_en_el_servidor(self):
        r = self._post(
            "/api/cotizaciones/",
            {
                "cliente_id": self.cliente.id,
                "items": [
                    {"mueble_id": self.escritorio.id, "cantidad": 2},
                    {"mueble_id": self.silla.id, "cantidad": 1},
                ],
            },
        )
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["total"], 2500)
        self.assertEqual(Cotizacion.objects.get().total, 2500)

    def test_precio_enviado_por_el_cliente_se_ignora(self):
        r = self._post(
            "/api/cotizaciones/",
            {
                "cliente_id": self.cliente.id,
                "items": [{"mueble_id": self.silla.id, "cantidad": 1, "precio": 1}],
            },
        )
        self.assertEqual(r.json()["total"], 500)

    def test_sin_items_es_error(self):
        r = self._post("/api/cotizaciones/", {"cliente_id": self.cliente.id, "items": []})
        self.assertEqual(r.status_code, 400)

    def test_mueble_inexistente_es_error(self):
        r = self._post(
            "/api/cotizaciones/",
            {"cliente_id": self.cliente.id, "items": [{"mueble_id": 999999, "cantidad": 1}]},
        )
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Cotizacion.objects.count(), 0)

    def test_cantidad_debe_ser_positiva(self):
        r = self._post(
            "/api/cotizaciones/",
            {"cliente_id": self.cliente.id, "items": [{"mueble_id": self.silla.id, "cantidad": 0}]},
        )
        self.assertEqual(r.status_code, 400)

    def test_cliente_inexistente_es_error(self):
        r = self._post(
            "/api/cotizaciones/",
            {"cliente_id": 999999, "items": [{"mueble_id": self.silla.id, "cantidad": 1}]},
        )
        self.assertEqual(r.status_code, 400)

    def test_listar_cotizaciones_incluye_items_y_autor(self):
        self._post(
            "/api/cotizaciones/",
            {"cliente_id": self.cliente.id, "items": [{"mueble_id": self.silla.id, "cantidad": 2}]},
        )
        r = self.client.get("/api/cotizaciones/")
        self.assertEqual(len(r.json()), 1)
        cotizacion = r.json()[0]
        self.assertEqual(cotizacion["cliente_nombre"], "Carlos")
        self.assertEqual(cotizacion["creado_por"], "comercial")
        self.assertEqual(cotizacion["items"][0]["subtotal"], 1000)

    def test_cotizacion_queda_registrada_en_bitacora(self):
        self._post(
            "/api/cotizaciones/",
            {"cliente_id": self.cliente.id, "items": [{"mueble_id": self.silla.id, "cantidad": 1}]},
        )
        self.assertTrue(Bitacora.objects.filter(accion="cotizacion_creada").exists())

    def test_consulta_no_puede_crear_cotizaciones(self):
        self.entrar_como("Consulta", "consulta")
        r = self._post(
            "/api/cotizaciones/",
            {"cliente_id": self.cliente.id, "items": [{"mueble_id": self.silla.id, "cantidad": 1}]},
        )
        self.assertEqual(r.status_code, 403)



class InventarioApiTests(_ApiTestCase):
    def setUp(self):
        super().setUp()
        self.bodega = self.entrar_como("Bodega", "bodega")
        self.silla = Mueble.objects.create(nombre="Silla", categoria="Sillas", precio=500)

    def _movimiento(self, tipo, cantidad, sede="Bogotá", motivo="", mueble=None):
        return self._post(
            "/api/movimientos/",
            {
                "mueble_id": (mueble or self.silla).id,
                "sede": sede,
                "tipo": tipo,
                "cantidad": cantidad,
                "motivo": motivo,
            },
        )

    def test_entrada_suma_existencia(self):
        r = self._movimiento("entrada", 10)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["existencia"]["cantidad"], 10)
        self.assertEqual(r.json()["movimiento"]["delta"], 10)

    def test_salida_resta_existencia(self):
        self._movimiento("entrada", 10)
        r = self._movimiento("salida", 4)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["existencia"]["cantidad"], 6)
        self.assertEqual(r.json()["movimiento"]["delta"], -4)
        self.assertEqual(r.json()["movimiento"]["saldo"], 6)

    def test_salida_sin_stock_se_rechaza_sin_dejar_rastro(self):
        r = self._movimiento("salida", 1)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(MovimientoInventario.objects.count(), 0)
        self.assertEqual(Existencia.objects.count(), 0)

    def test_ajuste_negativo_no_deja_saldo_negativo(self):
        self._movimiento("entrada", 3)
        r = self._movimiento("ajuste", -5, motivo="conteo físico")
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Existencia.objects.get().cantidad, 3)

    def test_ajuste_requiere_motivo(self):
        r = self._movimiento("ajuste", 2)
        self.assertEqual(r.status_code, 400)

    def test_ajuste_con_motivo_positivo_funciona(self):
        r = self._movimiento("ajuste", 2, motivo="sobrante en conteo")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Existencia.objects.get().cantidad, 2)

    def test_cantidad_debe_ser_positiva_en_entradas_y_salidas(self):
        self.assertEqual(self._movimiento("entrada", 0).status_code, 400)
        self.assertEqual(self._movimiento("salida", -2).status_code, 400)

    def test_sede_invalida(self):
        r = self._movimiento("entrada", 1, sede="Cali")
        self.assertEqual(r.status_code, 400)

    def test_tipo_invalido(self):
        r = self._movimiento("prestamo", 1)
        self.assertEqual(r.status_code, 400)

    def test_saldo_coincide_con_suma_de_movimientos(self):
        self._movimiento("entrada", 10)
        self._movimiento("salida", 3)
        self._movimiento("ajuste", 2, motivo="conteo")
        existencia = Existencia.objects.get()
        suma = sum(m.delta for m in MovimientoInventario.objects.all())
        self.assertEqual(existencia.cantidad, 9)
        self.assertEqual(suma, existencia.cantidad)

    def test_stock_se_separa_por_sede(self):
        self._movimiento("entrada", 5, sede="Bogotá")
        self._movimiento("entrada", 2, sede="Miami")
        r = self.client.get("/api/inventario/?sede=Miami")
        self.assertEqual([e["cantidad"] for e in r.json()], [2])

    def test_movimiento_queda_en_bitacora(self):
        self._movimiento("entrada", 1)
        self.assertTrue(Bitacora.objects.filter(accion="movimiento_inventario").exists())

    def test_comercial_puede_consultar_pero_no_registrar(self):
        self._movimiento("entrada", 4)
        self.entrar_como("Comercial", "comercial")
        self.assertEqual(self.client.get("/api/inventario/").status_code, 200)
        self.assertEqual(self.client.get("/api/movimientos/").status_code, 403)
        self.assertEqual(self._movimiento("entrada", 1).status_code, 403)

    def test_consulta_no_puede_registrar(self):
        self.entrar_como("Consulta", "consulta")
        self.assertEqual(self._movimiento("entrada", 1).status_code, 403)
