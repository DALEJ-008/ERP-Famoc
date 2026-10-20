import { useState } from 'react'
import * as api from '../api'

function Login({ errorInicial, onIngresar }) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(errorInicial || '')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!usuario.trim() || !clave) {
      setError('Escribe tu usuario y tu contraseña.')
      return
    }
    setError('')
    setEnviando(true)
    try {
      const nuevaSesion = await api.iniciarSesion(usuario.trim(), clave)
      onIngresar(nuevaSesion)
    } catch (err) {
      setError(err.message)
      setClave('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="panel login">
      <h2>Iniciar sesión</h2>
      <form className="formulario" onSubmit={handleSubmit}>
        <label className="campo">
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" />
        </label>
        <label className="campo">
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <button className="boton-principal" type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      {error && <p className="error-texto">{error}</p>}
    </div>
  )
}

export default Login
