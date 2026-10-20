from django.urls import path

from . import views

urlpatterns = [
    path("sesion/", views.sesion, name="sesion"),
    path("login/", views.iniciar_sesion, name="login"),
    path("logout/", views.cerrar_sesion, name="logout"),
    path("clientes/", views.clientes, name="clientes"),
    path("clientes/<int:pk>/", views.cliente_detalle, name="cliente_detalle"),
    path("muebles/", views.muebles, name="muebles"),
    path("cotizaciones/", views.cotizaciones, name="cotizaciones"),
    path("bitacora/", views.bitacora, name="bitacora"),
    path("inventario/", views.inventario, name="inventario"),
    path("movimientos/", views.movimientos, name="movimientos"),
]
