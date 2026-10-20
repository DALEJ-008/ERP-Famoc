"""
Carga el catálogo inicial de muebles de ejemplo.

Uso:  python manage.py cargar_muebles
Es idempotente: si el mueble ya existe, actualiza su categoría y precio.
Los precios son de ejemplo; reemplázalos desde el admin de Django.
"""

from django.core.management.base import BaseCommand

from famocapp.models import Mueble

CATALOGO = [
    {"nombre": "Escritorio ejecutivo 160 cm", "categoria": "Escritorios", "precio": 1250000},
    {"nombre": "Escritorio operativo 120 cm", "categoria": "Escritorios", "precio": 680000},
    {"nombre": "Silla ergonómica con brazos", "categoria": "Sillas", "precio": 890000},
    {"nombre": "Silla de visitante apilable", "categoria": "Sillas", "precio": 320000},
    {"nombre": "Mesa de reuniones 6 puestos", "categoria": "Mesas de reunión", "precio": 2400000},
    {"nombre": "Archivador metálico 4 gavetas", "categoria": "Archivadores", "precio": 540000},
    {"nombre": "Estantería modular 5 niveles", "categoria": "Estanterías", "precio": 430000},
    {"nombre": "Cajonera móvil 3 gavetas", "categoria": "Cajoneras", "precio": 310000},
]


class Command(BaseCommand):
    help = "Carga el catálogo inicial de muebles de ejemplo."

    def handle(self, *args, **options):
        nuevos = 0
        for datos in CATALOGO:
            _, creado = Mueble.objects.update_or_create(
                nombre=datos["nombre"],
                defaults={"categoria": datos["categoria"], "precio": datos["precio"], "activo": True},
            )
            nuevos += int(creado)
        self.stdout.write(
            self.style.SUCCESS(f"Catálogo listo: {len(CATALOGO)} muebles ({nuevos} nuevos).")
        )
