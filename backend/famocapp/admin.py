from django.contrib import admin

<<<<<<< HEAD
from .models import (
    Bitacora,
    Cliente,
    Cotizacion,
    CotizacionItem,
    Existencia,
    Mueble,
    MovimientoInventario,
)


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nombre", "telefono", "ciudad", "creado", "creado_por")
    search_fields = ("nombre", "telefono")
    list_filter = ("ciudad",)
    readonly_fields = ("creado_por",)


@admin.register(Mueble)
class MuebleAdmin(admin.ModelAdmin):
    list_display = ("nombre", "categoria", "precio", "activo")
    list_filter = ("categoria", "activo")
    search_fields = ("nombre",)


class CotizacionItemInline(admin.TabularInline):
    model = CotizacionItem
    extra = 0
    readonly_fields = ("subtotal",)


@admin.register(Cotizacion)
class CotizacionAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "fecha", "total", "creado_por")
    list_filter = ("fecha",)
    readonly_fields = ("total", "fecha", "creado_por")
    inlines = [CotizacionItemInline]


@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    """La bitácora es de solo lectura: no se edita ni se borra desde el admin."""

    list_display = ("fecha", "usuario", "accion", "entidad", "entidad_id", "detalle")
    list_filter = ("accion", "entidad")
    search_fields = ("usuario__username", "detalle")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False



class _SoloLectura(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Existencia)
class ExistenciaAdmin(_SoloLectura):
    """El stock se modifica solo con movimientos, para mantener la trazabilidad."""

    list_display = ("mueble", "sede", "cantidad")
    list_filter = ("sede",)
    search_fields = ("mueble__nombre",)


@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(_SoloLectura):
    list_display = ("fecha", "mueble", "sede", "tipo", "delta", "saldo", "usuario")
    list_filter = ("tipo", "sede")
    search_fields = ("mueble__nombre", "motivo")
=======
# Register your models here.
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
