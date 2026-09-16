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

## Estructura

```
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
