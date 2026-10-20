"""
Crea los roles del ERP (grupos de Django) y asigna sus permisos.

Uso:  python manage.py configurar_roles
Es idempotente: se puede ejecutar varias veces. Al ejecutarlo se restablecen
los permisos de cada rol según la tabla de abajo.

Para crear usuarios y asignarles un rol, usa el admin de Django (/admin/),
sección Usuarios, o `python manage.py createsuperuser` para el primer administrador.
"""

from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

# None = todos los permisos de la app famocapp.
PERMISOS_POR_ROL = {
    "Administrador": None,
    "Comercial": [
        "view_cliente",
        "add_cliente",
        "view_mueble",
        "view_cotizacion",
        "add_cotizacion",
        "view_existencia",
    ],
    "Bodega": [
        "view_mueble",
        "view_existencia",
        "view_movimientoinventario",
        "add_movimientoinventario",
    ],
    "Consulta": [
        "view_cliente",
        "view_mueble",
        "view_cotizacion",
        "view_existencia",
    ],
}


class Command(BaseCommand):
    help = "Crea los roles (grupos) del ERP y asigna sus permisos."

    def handle(self, *args, **options):
        for nombre, codenames in PERMISOS_POR_ROL.items():
            grupo, _ = Group.objects.get_or_create(name=nombre)
            permisos = Permission.objects.filter(content_type__app_label="famocapp")
            if codenames is not None:
                permisos = permisos.filter(codename__in=codenames)
            grupo.permissions.set(permisos)
            self.stdout.write(f"Rol '{nombre}': {permisos.count()} permisos.")
        self.stdout.write(self.style.SUCCESS("Roles configurados."))
