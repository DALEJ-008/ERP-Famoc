import muebles from '../data/muebles'

function formatoPrecio(valor) {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Issue #11: Como empleado comercial quiero visualizar el catálogo
// de muebles disponibles para seleccionarlos en una atención al cliente.
function Catalogo({ onAgregar }) {
  return (
    <div className="panel">
      <h2>Catálogo de muebles</h2>
      <p className="ayuda">Selecciona un mueble para agregarlo a la cotización en curso.</p>

      <div className="tabla">
        <div className="tabla-fila tabla-cabecera">
          <span>Mueble</span>
          <span>Categoría</span>
          <span>Precio</span>
          <span></span>
        </div>
        {muebles.map((mueble) => (
          <div className="tabla-fila" key={mueble.id}>
            <span>{mueble.nombre}</span>
            <span>{mueble.categoria}</span>
            <span>{formatoPrecio(mueble.precio)}</span>
            <span>
              <button onClick={() => onAgregar(mueble)}>Agregar</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Catalogo
