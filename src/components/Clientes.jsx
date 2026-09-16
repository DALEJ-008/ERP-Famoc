import { useState } from 'react'

// Issue #13: Como empleado comercial quiero registrar y administrar los
// clientes para gestionar las relaciones comerciales.
function Clientes({ clientes, onAgregarCliente, onEliminarCliente }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')

  function handleAgregar(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    onAgregarCliente({ id: Date.now(), nombre, telefono, ciudad })
    setNombre('')
    setTelefono('')
    setCiudad('')
  }

  return (
    <div className="panel">
      <h2>Clientes</h2>

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
            <option value="Bogotá">Bogotá</option>
            <option value="Medellín">Medellín</option>
            <option value="Barranquilla">Barranquilla</option>
            <option value="Miami">Miami</option>
          </select>
        </label>
        <button className="boton-principal" type="submit">Registrar cliente</button>
      </form>

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
                <button onClick={() => onEliminarCliente(c.id)}>Eliminar</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clientes
