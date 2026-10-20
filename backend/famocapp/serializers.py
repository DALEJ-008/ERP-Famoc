"""Conversión de modelos a diccionarios serializables en JSON."""


def _nombre_usuario(usuario):
    return usuario.get_username() if usuario else None


def cliente_a_dict(cliente):
    return {
        "id": cliente.id,
        "nombre": cliente.nombre,
        "telefono": cliente.telefono,
        "ciudad": cliente.ciudad,
    }


def mueble_a_dict(mueble):
    return {
        "id": mueble.id,
        "nombre": mueble.nombre,
        "categoria": mueble.categoria,
        "precio": mueble.precio,
    }


def cotizacion_a_dict(cotizacion):
    return {
        "id": cotizacion.id,
        "cliente_id": cotizacion.cliente_id,
        "cliente_nombre": cotizacion.cliente.nombre,
        "fecha": cotizacion.fecha.isoformat(),
        "total": cotizacion.total,
        "creado_por": _nombre_usuario(cotizacion.creado_por),
        "items": [
            {
                "mueble_id": item.mueble_id,
                "nombre": item.mueble.nombre,
                "cantidad": item.cantidad,
                "precio_unitario": item.precio_unitario,
                "subtotal": item.subtotal,
            }
            for item in cotizacion.items.all()
        ],
    }


def sesion_a_dict(usuario):
    if not usuario.is_authenticated:
        return {"autenticado": False, "permisos": [], "roles": []}
    return {
        "autenticado": True,
        "usuario": usuario.get_username(),
        "nombre": usuario.get_full_name() or usuario.get_username(),
        "roles": list(usuario.groups.values_list("name", flat=True)),
        "permisos": sorted(usuario.get_all_permissions()),
    }


def bitacora_a_dict(registro):
    return {
        "id": registro.id,
        "fecha": registro.fecha.isoformat(),
        "usuario": _nombre_usuario(registro.usuario),
        "accion": registro.accion,
        "entidad": registro.entidad,
        "entidad_id": registro.entidad_id,
        "detalle": registro.detalle,
    }


def existencia_a_dict(existencia):
    return {
        "id": existencia.id,
        "mueble_id": existencia.mueble_id,
        "mueble": existencia.mueble.nombre,
        "categoria": existencia.mueble.categoria,
        "sede": existencia.sede,
        "cantidad": existencia.cantidad,
    }


def movimiento_a_dict(movimiento):
    return {
        "id": movimiento.id,
        "fecha": movimiento.fecha.isoformat(),
        "mueble_id": movimiento.mueble_id,
        "mueble": movimiento.mueble.nombre,
        "sede": movimiento.sede,
        "tipo": movimiento.tipo,
        "delta": movimiento.delta,
        "saldo": movimiento.saldo,
        "motivo": movimiento.motivo,
        "usuario": _nombre_usuario(movimiento.usuario),
    }
