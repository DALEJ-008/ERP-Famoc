<<<<<<< HEAD
from django.conf import settings
from django.db import models


class Sede(models.TextChoices):
    BOGOTA = "Bogotá", "Bogotá"
    MEDELLIN = "Medellín", "Medellín"
    BARRANQUILLA = "Barranquilla", "Barranquilla"
    MIAMI = "Miami", "Miami"


class Cliente(models.Model):
    nombre = models.CharField(max_length=150)
    telefono = models.CharField(max_length=30, blank=True)
    ciudad = models.CharField(max_length=20, choices=Sede.choices, blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    # Trazabilidad: usuario que registró el cliente.
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    class Meta:
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Mueble(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    categoria = models.CharField(max_length=80)
    precio = models.PositiveIntegerField(help_text="Precio unitario en COP.")
    activo = models.BooleanField(default=True, help_text="Solo los activos aparecen en el catálogo.")

    class Meta:
        ordering = ["categoria", "nombre"]

    def __str__(self):
        return self.nombre


class Cotizacion(models.Model):
    # PROTECT: no se puede borrar un cliente que tenga cotizaciones registradas.
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name="cotizaciones")
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.PositiveIntegerField(default=0, help_text="Total calculado en el servidor, en COP.")
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )

    class Meta:
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return f"Cotización #{self.pk} — {self.cliente}"


class CotizacionItem(models.Model):
    cotizacion = models.ForeignKey(Cotizacion, on_delete=models.CASCADE, related_name="items")
    mueble = models.ForeignKey(Mueble, on_delete=models.PROTECT, related_name="en_cotizaciones")
    cantidad = models.PositiveIntegerField(default=1)
    # Se guarda el precio del momento: cambios futuros al catálogo no alteran cotizaciones previas.
    precio_unitario = models.PositiveIntegerField()

    class Meta:
        ordering = ["id"]

    @property
    def subtotal(self):
        return self.cantidad * self.precio_unitario


class Bitacora(models.Model):
    """Registro de actividad: inicios de sesión, altas, bajas y cotizaciones (RF-03)."""

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    accion = models.CharField(max_length=40)
    entidad = models.CharField(max_length=40)
    entidad_id = models.PositiveIntegerField(null=True, blank=True)
    detalle = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha", "-id"]
        verbose_name_plural = "bitácora"

    def __str__(self):
        return f"{self.accion} ({self.entidad})"


class Existencia(models.Model):
    """Stock de un mueble en una sede. Solo cambia a través de MovimientoInventario."""

    mueble = models.ForeignKey(Mueble, on_delete=models.PROTECT, related_name="existencias")
    sede = models.CharField(max_length=20, choices=Sede.choices)
    cantidad = models.IntegerField(default=0)

    class Meta:
        ordering = ["sede", "mueble__nombre"]
        constraints = [
            models.UniqueConstraint(fields=["mueble", "sede"], name="unica_existencia_por_sede"),
            models.CheckConstraint(condition=models.Q(cantidad__gte=0), name="existencia_no_negativa"),
        ]

    def __str__(self):
        return f"{self.mueble} en {self.sede}: {self.cantidad}"


class MovimientoInventario(models.Model):
    class Tipo(models.TextChoices):
        ENTRADA = "entrada", "Entrada"
        SALIDA = "salida", "Salida"
        AJUSTE = "ajuste", "Ajuste"

    mueble = models.ForeignKey(Mueble, on_delete=models.PROTECT, related_name="movimientos")
    sede = models.CharField(max_length=20, choices=Sede.choices)
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    delta = models.IntegerField(help_text="Variación del stock: positiva suma, negativa resta.")
    saldo = models.IntegerField(help_text="Existencia resultante después del movimiento.")
    motivo = models.CharField(max_length=200, blank=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return f"{self.get_tipo_display()} de {self.mueble} en {self.sede}"
=======
from django.db import models

# Create your models here.
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
