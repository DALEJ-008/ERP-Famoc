<<<<<<< HEAD
=======
import muebles from '../data/muebles'

>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
function formatoPrecio(valor) {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Issue #11: Como empleado comercial quiero visualizar el catálogo
// de muebles disponibles para seleccionarlos en una atención al cliente.
<<<<<<< HEAD
function Catalogo({ muebles, puedeAgregar, onAgregar }) {
  return (
    <div className="panel">
      <h2>Catálogo de muebles</h2>
      {puedeAgregar && <p className="ayuda">Selecciona un mueble para agregarlo a la cotización en curso.</p>}

      {muebles.length === 0 ? (
        <p className="ayuda">No hay muebles disponibles en el catálogo.</p>
      ) : (
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
                {puedeAgregar ? <button onClick={() => onAgregar(mueble)}>Agregar</button> : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
=======
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
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
    </div>
  )
}

export default Catalogo
