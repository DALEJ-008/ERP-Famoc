<<<<<<< HEAD
# ERP Famoc — Comercial e Inventarios

Sistema ERP web para Famoc Depanel. Esta versión cubre los módulos **Comercial**
(clientes, catálogo, cotizaciones) e **Inventarios** (existencias por sede y movimientos),
con **inicio de sesión, roles y bitácora**.

- **Backend:** Django + API REST propia (`/api/`), PostgreSQL.
- **Frontend:** React + Vite. En desarrollo, Vite reenvía `/api` a Django en el puerto 8000.

## Funcionalidades

| Issue | Historia | Dónde |
|------|----------|-------|
| #11 | Ver el catálogo de muebles | Pestaña **Catálogo** |
| #10 | Registrar una cotización con varios muebles | Pestaña **Cotizaciones** |
| #12 | Consultar cotizaciones registradas | Pestaña **Cotizaciones** (tabla inferior) |
| #13 | Registrar y administrar clientes | Pestaña **Clientes** |
| RF-03 | Usuarios, roles, permisos y trazabilidad | Inicio de sesión, pestaña **Bitácora** |
| RF-04 | Módulo de Inventarios | Pestaña **Inventario** (existencias y movimientos por sede) |

Reglas de negocio en el servidor:

- El total y los precios de una cotización se calculan en Django; el precio queda guardado en cada ítem.
- No se puede eliminar un cliente con cotizaciones (responde 409).
- El stock solo cambia mediante movimientos (entrada, salida o ajuste) y nunca queda negativo.
  Cada movimiento se hace en una transacción con bloqueo de fila, así dos operaciones simultáneas
  no pueden leer el mismo saldo.
- Los ajustes exigen un motivo. Los movimientos quedan en la bitácora.
- Las cotizaciones **no descuentan stock**: una cotización no es una venta. Descontar inventario
  al vender requiere un módulo de pedidos o ventas, que está pendiente.

## Roles y permisos

Los permisos se asignan por rol. `python manage.py configurar_roles` crea estos roles:

| Rol | Puede |
|-----|-------|
| **Administrador** | Todo, incluida la bitácora y eliminar clientes |
| **Comercial** | Ver y registrar clientes; ver catálogo y existencias; crear y consultar cotizaciones |
| **Bodega** | Ver catálogo y existencias; registrar movimientos de inventario |
| **Consulta** | Solo consultar clientes, catálogo, cotizaciones y existencias |

La interfaz muestra solo las pestañas y botones que el usuario puede usar, y la API
los verifica de nuevo en cada petición. Las acciones quedan registradas en la bitácora
con el usuario que las hizo.

## Requisitos

- Python 3.12 o superior
- Node.js 18 o superior
- PostgreSQL 14 o superior (o SQLite para pruebas rápidas, ver abajo)

## 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Crea la base de datos `ERP_Famoc` en PostgreSQL y define la contraseña por variable de entorno:

```bash
export DB_PASSWORD="tu_contraseña"  # Windows (PowerShell): $env:DB_PASSWORD="..."
```

Luego, en este orden:

```bash
python manage.py makemigrations famocapp   # genera las migraciones (primera vez o tras cambios)
python manage.py migrate
python manage.py configurar_roles          # crea los roles Administrador, Comercial y Consulta
python manage.py cargar_muebles            # catálogo de ejemplo
python manage.py createsuperuser           # primer administrador del sistema
python manage.py test famocapp             # pruebas automáticas (incluye inventario)
python manage.py runserver                 # http://127.0.0.1:8000
```

Para crear más usuarios: entra a `http://127.0.0.1:8000/admin/`, ve a **Usuarios**,
crea el usuario, establece su contraseña y asígnale un rol en el campo **Grupos**
(Administrador, Comercial o Consulta). Para que el usuario pueda entrar a la aplicación,
no necesita ser "miembro del personal" del admin: basta con que esté activo y tenga rol.

Para probar sin PostgreSQL: `export DB_ENGINE=sqlite` antes de los comandos anteriores.

## 2. Frontend

En otra terminal:

```bash
npm install
npm run dev                                # http://localhost:5173
```

Deja corriendo Django en el puerto 8000. Si Vite abre otro puerto (por ejemplo 5174),
agrégalo a `DJANGO_CSRF_TRUSTED_ORIGINS` (ver variables de entorno).

## Endpoints de la API

| Método | Ruta | Permiso | Descripción |
|-------|------|---------|-------------|
| GET | `/api/sesion/` | público | Estado de la sesión actual |
| POST | `/api/login/` | público | Inicia sesión `{usuario, clave}` |
| POST | `/api/logout/` | — | Cierra la sesión |
| GET | `/api/muebles/` | view_mueble | Muebles activos del catálogo |
| GET | `/api/clientes/` | view_cliente | Lista de clientes |
| POST | `/api/clientes/` | add_cliente | Crea un cliente `{nombre, telefono, ciudad}` |
| DELETE | `/api/clientes/<id>/` | delete_cliente | Elimina un cliente (409 si tiene cotizaciones) |
| GET | `/api/cotizaciones/` | view_cotizacion | Cotizaciones con sus ítems |
| POST | `/api/cotizaciones/` | add_cotizacion | Crea una cotización `{cliente_id, items: [{mueble_id, cantidad}]}` |
| GET | `/api/bitacora/` | view_bitacora | Últimos 200 registros de actividad |
| GET | `/api/inventario/?sede=...` | view_existencia | Existencias por mueble y sede (sede opcional) |
| GET | `/api/movimientos/` | view_movimientoinventario | Últimos 200 movimientos de inventario |
| POST | `/api/movimientos/` | add_movimientoinventario | Registra `{mueble_id, sede, tipo, cantidad, motivo}`; tipo: `entrada`, `salida` o `ajuste` (cantidad con signo) |

Las escrituras (POST, DELETE) requieren la cabecera `X-CSRFToken`; el frontend la envía
automáticamente. Sin sesión, la API responde 401; sin permiso, 403.

Las sedes válidas para `ciudad` son: Bogotá, Medellín, Barranquilla, Miami.

## Variables de entorno (backend)

| Variable | Por defecto | Uso |
|---------|-------------|-----|
| `DJANGO_SECRET_KEY` | valor de desarrollo | Clave secreta. **Obligatoria en producción.** |
| `DJANGO_DEBUG` | `1` | Poner `0` en producción |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hosts separados por coma |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Orígenes del frontend, separados por coma |
| `DJANGO_HTTPS` | `0` | Poner `1` cuando el sitio use HTTPS (cookies seguras) |
| `DB_ENGINE` | `postgres` | `sqlite` para pruebas locales |
| `DB_NAME`, `DB_USER`, `DB_HOST`, `DB_PORT` | `ERP_Famoc`, `postgres`, `localhost`, `5432` | Conexión a PostgreSQL |
| `DB_PASSWORD` | vacío | Contraseña de PostgreSQL |
=======
# ERP Famoc — Frontend (Sprint Planning 1)

Versión inicial, **solo frontend**, sin conexión a backend todavía. Todos los datos (clientes, cotizaciones) viven en memoria (`useState`) y se pierden al recargar la página. Esto es intencional: el objetivo de este sprint es tener la interfaz funcionando antes de integrarla con la API de Django.

## Issues cubiertos (Milestone "Sprint Planning 1")

- **#11** — Ver catálogo de muebles disponibles → pestaña **Catálogo**.
- **#10** — Registrar una cotización sumando varios muebles → pestaña **Cotizaciones** (formulario "Nueva cotización").
- **#12** — Consultar cotizaciones registradas → pestaña **Cotizaciones** (tabla inferior).
- **#13** — Registrar y administrar clientes → pestaña **Clientes**.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que muestre la terminal (por defecto http://localhost:5173).
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f

## Estructura

```
<<<<<<< HEAD
backend/
  erpfamoc/            configuración del proyecto (settings, urls)
  famocapp/
    models.py          Cliente, Mueble, Cotizacion, CotizacionItem, Bitacora, Existencia, MovimientoInventario
    serializers.py     modelos → JSON
    views.py           API REST con autenticación y permisos
    urls.py            rutas /api/
    admin.py           administración en /admin/ (bitácora de solo lectura)
    tests.py           pruebas de la API, sesiones, roles y CSRF
    management/commands/
      configurar_roles.py    crea los roles y sus permisos
      cargar_muebles.py      catálogo inicial
src/
  api.js               cliente HTTP hacia /api (con CSRF)
  App.jsx              sesión, navegación y estado
  components/          Login, Catalogo, Clientes, Cotizaciones, Inventario, Bitacora
```

## Pendiente (próximas etapas)

- **Seguridad adicional (RF-03):** recuperación de contraseña, bloqueo tras varios intentos fallidos y autenticación de dos factores.
- **Módulos restantes (RF-04):** Producción, Contabilidad, Administración y Alquileres.
- **Ventas y pedidos:** descontar inventario al confirmar una venta, a partir de una cotización aceptada.
- **Integración de módulos (RF-05)** y **respaldo e integraciones externas (RF-07)**.

## Nota sobre credenciales

Una versión anterior del repositorio tenía la contraseña de PostgreSQL escrita en
`settings.py`. Esa contraseña debe considerarse expuesta: cámbiala en PostgreSQL.
Si el repositorio fue compartido, también conviene rotar `DJANGO_SECRET_KEY`.
=======
src/
  App.jsx              # navegación por pestañas + estado compartido
  App.css              # estilos
  components/
    Catalogo.jsx        # issue #11
    Cotizaciones.jsx     # issues #10 y #12
    Clientes.jsx          # issue #13
  data/
    muebles.js           # catálogo de ejemplo (mock)
```

## Próximos pasos sugeridos

1. Reemplazar `src/data/muebles.js` por una llamada real a la API de Django (RF-06).
2. Persistir clientes y cotizaciones en PostgreSQL en lugar de `useState` (RF-02).
3. Agregar validaciones y manejo de errores más completos.
4. Sumar autenticación/roles cuando se aborde RF-03.
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
