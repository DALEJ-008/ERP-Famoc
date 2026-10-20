// Trazabilidad (RF-03): registro de inicios de sesión, altas, bajas y cotizaciones.

function formatoFecha(iso) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

function Bitacora({ registros, cargando, onRecargar }) {
  return (
    <div className="panel">
      <h2>Bitácora de actividad</h2>
      <p className="ayuda">Inicios de sesión, clientes y cotizaciones registrados en el sistema.</p>
      <button onClick={onRecargar} disabled={cargando}>
        {cargando ? 'Actualizando…' : 'Actualizar'}
      </button>

      {registros.length === 0 ? (
        <p className="ayuda">No hay actividad registrada.</p>
      ) : (
        <div className="tabla">
          <div className="tabla-fila tabla-cabecera cinco-columnas">
            <span>Fecha</span>
            <span>Usuario</span>
            <span>Acción</span>
            <span>Entidad</span>
            <span>Detalle</span>
          </div>
          {registros.map((r) => (
            <div className="tabla-fila cinco-columnas" key={r.id}>
              <span>{formatoFecha(r.fecha)}</span>
              <span>{r.usuario || '—'}</span>
              <span>{r.accion}</span>
              <span>{r.entidad}</span>
              <span>{r.detalle || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bitacora
