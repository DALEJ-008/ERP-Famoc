import { useState } from 'react'

function formatoPrecio(valor) {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Issue #10: Como empleado comercial quiero registrar una cotización sumando
// varios muebles para informar al cliente el costo total.
// Issue #12: Como empleado comercial quiero consultar las cotizaciones
// registradas para hacerles seguimiento.
function Cotizaciones({ clientes, itemsSeleccionados, onQuitarItem, cotizaciones, onGuardarCotizacion }) {
  const [clienteId, setClienteId] = useState('')

  const total = itemsSeleccionados.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

  function handleGuardar() {
    if (!clienteId) {
      alert('Selecciona un cliente antes de guardar la cotización.')
      return
    }
    if (itemsSeleccionados.length === 0) {
      alert('Agrega al menos un mueble desde el catálogo.')
      return
    }
    const cliente = clientes.find((c) => String(c.id) === clienteId)
    onGuardarCotizacion({
      id: Date.now(),
      cliente: cliente.nombre,
      fecha: new Date().toLocaleDateString('es-CO'),
      items: itemsSeleccionados,
      total,
    })
    setClienteId('')
  }

  return (
    <div className="panel">
      <h2>Nueva cotización</h2>

      <label className="campo">
        Cliente
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Selecciona un cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </label>

      {itemsSeleccionados.length === 0 ? (
        <p className="ayuda">Aún no has agregado muebles. Ve al catálogo y agrega algunos.</p>
      ) : (
        <div className="tabla">
          <div className="tabla-fila tabla-cabecera">
            <span>Mueble</span>
            <span>Cantidad</span>
            <span>Subtotal</span>
            <span></span>
          </div>
          {itemsSeleccionados.map((item) => (
            <div className="tabla-fila" key={item.id}>
              <span>{item.nombre}</span>
              <span>{item.cantidad}</span>
              <span>{formatoPrecio(item.precio * item.cantidad)}</span>
              <span>
                <button onClick={() => onQuitarItem(item.id)}>Quitar</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="total">Total: {formatoPrecio(total)}</p>
      <button className="boton-principal" onClick={handleGuardar}>Guardar cotización</button>

      <h2 style={{ marginTop: '2rem' }}>Cotizaciones registradas</h2>
      {cotizaciones.length === 0 ? (
        <p className="ayuda">Todavía no hay cotizaciones guardadas.</p>
      ) : (
        <div className="tabla">
          <div className="tabla-fila tabla-cabecera">
            <span>Cliente</span>
            <span>Fecha</span>
            <span>Ítems</span>
            <span>Total</span>
          </div>
          {cotizaciones.map((cot) => (
            <div className="tabla-fila" key={cot.id}>
              <span>{cot.cliente}</span>
              <span>{cot.fecha}</span>
              <span>{cot.items.length}</span>
              <span>{formatoPrecio(cot.total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Cotizaciones
