import { useState } from 'react'

const SEDES = ['Bogotá', 'Medellín', 'Barranquilla', 'Miami']

// Issue #13: Como empleado comercial quiero registrar y administrar los
// clientes para gestionar las relaciones comerciales.
function Clientes({ clientes, puedeCrear, puedeEliminar, onAgregarCliente, onEliminarCliente }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleAgregar(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)
    try {
      await onAgregarCliente({ nombre: nombre.trim(), telefono: telefono.trim(), ciudad })
      setNombre('')
      setTelefono('')
      setCiudad('')
    } catch (err) {
      alert(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleEliminar(id) {
    try {
      await onEliminarCliente(id)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="panel">
      <h2>Clientes</h2>

      {puedeCrear && (
        <form className="formulario" onSubmit={handleAgregar}>
          <label className="campo">
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del cliente" />
          </label>
          <label className="campo">
            Teléfono
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Opcional" />
          </label>
          <label className="campo">
            Ciudad
            <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              <option value="">Selecciona sede</option>
              {SEDES.map((sede) => (
                <option key={sede} value={sede}>{sede}</option>
              ))}
            </select>
          </label>
          <button className="boton-principal" type="submit" disabled={guardando}>
            {guardando ? 'Registrando…' : 'Registrar cliente'}
          </button>
        </form>
      )}

      {clientes.length === 0 ? (
        <p className="ayuda">Todavía no hay clientes registrados.</p>
      ) : (
        <div className="tabla">
          <div className="tabla-fila tabla-cabecera">
            <span>Nombre</span>
            <span>Teléfono</span>
            <span>Ciudad</span>
            <span></span>
          </div>
          {clientes.map((c) => (
            <div className="tabla-fila" key={c.id}>
              <span>{c.nombre}</span>
              <span>{c.telefono || '—'}</span>
              <span>{c.ciudad || '—'}</span>
              <span>
                {puedeEliminar && <button onClick={() => handleEliminar(c.id)}>Eliminar</button>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clientes
