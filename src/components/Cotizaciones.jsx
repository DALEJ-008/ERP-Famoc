import { useState } from 'react'

function formatoPrecio(valor) {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

// Issue #10: Como empleado comercial quiero registrar una cotización sumando
// varios muebles para informar al cliente el costo total.
// Issue #12: Como empleado comercial quiero consultar las cotizaciones
// registradas para hacerles seguimiento.
<<<<<<< HEAD
function Cotizaciones({ clientes, puedeCrear, itemsSeleccionados, onQuitarItem, cotizaciones, onGuardarCotizacion }) {
  const [clienteId, setClienteId] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Si el cliente seleccionado fue eliminado, la selección deja de ser válida.
  const clienteValido = clientes.some((c) => String(c.id) === clienteId)
  const seleccion = clienteValido ? clienteId : ''

  // Total de vista previa; el servidor recalcula el total oficial al guardar.
  const total = itemsSeleccionados.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

  async function handleGuardar() {
    if (!seleccion) {
=======
function Cotizaciones({ clientes, itemsSeleccionados, onQuitarItem, cotizaciones, onGuardarCotizacion }) {
  const [clienteId, setClienteId] = useState('')

  const total = itemsSeleccionados.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

  function handleGuardar() {
    if (!clienteId) {
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
      alert('Selecciona un cliente antes de guardar la cotización.')
      return
    }
    if (itemsSeleccionados.length === 0) {
      alert('Agrega al menos un mueble desde el catálogo.')
      return
    }
<<<<<<< HEAD
    setGuardando(true)
    try {
      await onGuardarCotizacion(Number(seleccion))
      setClienteId('')
    } catch (err) {
      alert(err.message)
    } finally {
      setGuardando(false)
    }
=======
    const cliente = clientes.find((c) => String(c.id) === clienteId)
    onGuardarCotizacion({
      id: Date.now(),
      cliente: cliente.nombre,
      fecha: new Date().toLocaleDateString('es-CO'),
      items: itemsSeleccionados,
      total,
    })
    setClienteId('')
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
  }

  return (
    <div className="panel">
<<<<<<< HEAD
      {puedeCrear && (
        <>
          <h2>Nueva cotización</h2>

          {clientes.length === 0 && (
            <p className="ayuda">Primero registra un cliente en la pestaña Clientes.</p>
          )}

          <label className="campo">
            Cliente
            <select value={seleccion} onChange={(e) => setClienteId(e.target.value)}>
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
          <button className="boton-principal" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cotización'}
          </button>
        </>
      )}

      <h2 style={{ marginTop: puedeCrear ? '2rem' : 0 }}>Cotizaciones registradas</h2>
=======
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
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
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
<<<<<<< HEAD
              <span>{cot.cliente_nombre}</span>
              <span>{new Date(cot.fecha).toLocaleDateString('es-CO')}</span>
=======
              <span>{cot.cliente}</span>
              <span>{cot.fecha}</span>
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
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
