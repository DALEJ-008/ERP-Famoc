import { useMemo, useState } from 'react'

const SEDES = ['Bogotá', 'Medellín', 'Barranquilla', 'Miami']
const TIPOS = [
  { valor: 'entrada', etiqueta: 'Entrada' },
  { valor: 'salida', etiqueta: 'Salida' },
  { valor: 'ajuste', etiqueta: 'Ajuste (positivo o negativo)' },
]

function formatoFecha(iso) {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

function etiquetaTipo(tipo) {
  return TIPOS.find((t) => t.valor === tipo)?.etiqueta.split(' ')[0] || tipo
}

// Control de inventario por mueble y sede. El stock solo cambia mediante movimientos.
function Inventario({
  existencias,
  muebles,
  movimientos,
  puedeRegistrar,
  puedeVerMovimientos,
  onRegistrarMovimiento,
}) {
  const [sedeFiltro, setSedeFiltro] = useState('')
  const [muebleId, setMuebleId] = useState('')
  const [sede, setSede] = useState('')
  const [tipo, setTipo] = useState('entrada')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const existenciasFiltradas = useMemo(
    () =>
      existencias
        .filter((e) => !sedeFiltro || e.sede === sedeFiltro)
        .sort((a, b) => a.sede.localeCompare(b.sede, 'es') || a.mueble.localeCompare(b.mueble, 'es')),
    [existencias, sedeFiltro]
  )

  async function handleRegistrar(e) {
    e.preventDefault()
    const n = Number(cantidad)
    if (!muebleId || !sede) {
      alert('Selecciona un mueble y una sede.')
      return
    }
    if (!Number.isInteger(n) || n === 0) {
      alert('La cantidad debe ser un número entero distinto de cero.')
      return
    }
    if (tipo !== 'ajuste' && n < 0) {
      alert('En entradas y salidas la cantidad debe ser positiva.')
      return
    }
    if (tipo === 'ajuste' && !motivo.trim()) {
      alert('Los ajustes requieren un motivo.')
      return
    }

    setGuardando(true)
    try {
      await onRegistrarMovimiento({
        mueble_id: Number(muebleId),
        sede,
        tipo,
        cantidad: n,
        motivo: motivo.trim(),
      })
      setCantidad('')
      setMotivo('')
    } catch (err) {
      alert(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div className="panel">
        <h2>Existencias</h2>

        <label className="campo">
          Sede
          <select value={sedeFiltro} onChange={(e) => setSedeFiltro(e.target.value)}>
            <option value="">Todas las sedes</option>
            {SEDES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        {existenciasFiltradas.length === 0 ? (
          <p className="ayuda">No hay existencias registradas{sedeFiltro ? ` en ${sedeFiltro}` : ''}.</p>
        ) : (
          <div className="tabla">
            <div className="tabla-fila tabla-cabecera tres-columnas">
              <span>Mueble</span>
              <span>Sede</span>
              <span>Existencia</span>
            </div>
            {existenciasFiltradas.map((e) => (
              <div className="tabla-fila tres-columnas" key={e.id}>
                <span>{e.mueble}</span>
                <span>{e.sede}</span>
                <span>{e.cantidad}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {puedeRegistrar && (
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <h2>Registrar movimiento</h2>
          <form className="formulario" onSubmit={handleRegistrar}>
            <label className="campo">
              Mueble
              <select value={muebleId} onChange={(e) => setMuebleId(e.target.value)}>
                <option value="">Selecciona un mueble</option>
                {muebles.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </label>
            <label className="campo">
              Sede
              <select value={sede} onChange={(e) => setSede(e.target.value)}>
                <option value="">Selecciona sede</option>
                {SEDES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="campo">
              Tipo
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                ))}
              </select>
            </label>
            <label className="campo">
              Cantidad
              <input
                type="number"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
              />
            </label>
            <label className="campo">
              Motivo {tipo === 'ajuste' ? '' : '(opcional)'}
              <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. compra proveedor" />
            </label>
            <button className="boton-principal" type="submit" disabled={guardando}>
              {guardando ? 'Registrando…' : 'Registrar'}
            </button>
          </form>
        </div>
      )}

      {puedeVerMovimientos && (
        <div className="panel" style={{ marginTop: '1.5rem' }}>
          <h2>Movimientos recientes</h2>
          {movimientos.length === 0 ? (
            <p className="ayuda">Todavía no hay movimientos registrados.</p>
          ) : (
            <div className="tabla">
              <div className="tabla-fila tabla-cabecera seis-columnas">
                <span>Fecha</span>
                <span>Mueble</span>
                <span>Sede</span>
                <span>Movimiento</span>
                <span>Saldo</span>
                <span>Usuario</span>
              </div>
              {movimientos.map((m) => (
                <div className="tabla-fila seis-columnas" key={m.id} title={m.motivo || ''}>
                  <span>{formatoFecha(m.fecha)}</span>
                  <span>{m.mueble}</span>
                  <span>{m.sede}</span>
                  <span>
                    {etiquetaTipo(m.tipo)} {m.delta > 0 ? '+' : ''}
                    {m.delta}
                  </span>
                  <span>{m.saldo}</span>
                  <span>{m.usuario || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Inventario
