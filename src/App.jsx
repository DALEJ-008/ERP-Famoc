<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react'
import Login from './components/Login'
import Catalogo from './components/Catalogo'
import Cotizaciones from './components/Cotizaciones'
import Clientes from './components/Clientes'
import Bitacora from './components/Bitacora'
import Inventario from './components/Inventario'
import * as api from './api'

// Cada pestaña se muestra solo si el usuario tiene el permiso de verla.
const PESTANAS = [
  { id: 'catalogo', etiqueta: 'Catálogo', permiso: 'famocapp.view_mueble' },
  { id: 'cotizaciones', etiqueta: 'Cotizaciones', permiso: 'famocapp.view_cotizacion' },
  { id: 'clientes', etiqueta: 'Clientes', permiso: 'famocapp.view_cliente' },
  { id: 'inventario', etiqueta: 'Inventario', permiso: 'famocapp.view_existencia' },
  { id: 'bitacora', etiqueta: 'Bitácora', permiso: 'famocapp.view_bitacora' },
]

const SIN_SESION = { autenticado: false, permisos: [], roles: [] }

function App() {
  // null mientras se verifica la sesión; después, el estado devuelto por la API.
  const [sesion, setSesion] = useState(null)
  const [errorConexion, setErrorConexion] = useState('')
  const [pestanaActiva, setPestanaActiva] = useState('catalogo')

  const [muebles, setMuebles] = useState([])
  const [clientes, setClientes] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [bitacora, setBitacora] = useState([])
  const [existencias, setExistencias] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [cargandoBitacora, setCargandoBitacora] = useState(false)

  // Cotización en curso (solo en el navegador hasta que se guarda).
  const [itemsSeleccionados, setItemsSeleccionados] = useState([])

  const [cargando, setCargando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')

  const puede = (permiso) => Boolean(sesion?.permisos?.includes(permiso))
  const pestanasVisibles = PESTANAS.filter((p) => puede(p.permiso))
  const pestanaMostrada = pestanasVisibles.some((p) => p.id === pestanaActiva)
    ? pestanaActiva
    : pestanasVisibles[0]?.id

  // Borra todos los datos de la pantalla (al cerrar sesión o si expira).
  const cerrarSesionLocal = useCallback(() => {
    setSesion(SIN_SESION)
    setMuebles([])
    setClientes([])
    setCotizaciones([])
    setBitacora([])
    setExistencias([])
    setMovimientos([])
    setItemsSeleccionados([])
    setPestanaActiva('catalogo')
  }, [])

  const cargarDatos = useCallback(
    async (sesionActual) => {
      const tiene = (permiso) => sesionActual.permisos.includes(permiso)
      setCargando(true)
      setErrorCarga('')
      try {
        const [mueblesApi, clientesApi, cotizacionesApi, existenciasApi, movimientosApi] = await Promise.all([
          tiene('famocapp.view_mueble') ? api.obtenerMuebles() : [],
          tiene('famocapp.view_cliente') ? api.obtenerClientes() : [],
          tiene('famocapp.view_cotizacion') ? api.obtenerCotizaciones() : [],
          tiene('famocapp.view_existencia') ? api.obtenerExistencias() : [],
          tiene('famocapp.view_movimientoinventario') ? api.obtenerMovimientos() : [],
        ])
        setMuebles(mueblesApi)
        setClientes(clientesApi)
        setCotizaciones(cotizacionesApi)
        setExistencias(existenciasApi)
        setMovimientos(movimientosApi)
      } catch (err) {
        if (err.status === 401) cerrarSesionLocal()
        else setErrorCarga(err.message)
      } finally {
        setCargando(false)
      }
    },
    [cerrarSesionLocal]
  )

  const cargarBitacora = useCallback(async () => {
    setCargandoBitacora(true)
    try {
      setBitacora(await api.obtenerBitacora())
    } catch (err) {
      if (err.status === 401) cerrarSesionLocal()
      else alert(err.message)
    } finally {
      setCargandoBitacora(false)
    }
  }, [cerrarSesionLocal])

  // Al abrir la página: ¿hay una sesión activa?
  useEffect(() => {
    api
      .obtenerSesion()
      .then(setSesion)
      .catch((err) => {
        setSesion(SIN_SESION)
        setErrorConexion(err.message)
      })
  }, [])

  // Con sesión activa, cargar los datos permitidos.
  useEffect(() => {
    if (sesion?.autenticado) cargarDatos(sesion)
  }, [sesion, cargarDatos])

  // La bitácora se consulta solo cuando el usuario abre esa pestaña.
  useEffect(() => {
    if (pestanaMostrada === 'bitacora' && sesion?.autenticado) cargarBitacora()
  }, [pestanaMostrada, sesion, cargarBitacora])

  function handleIngresar(nuevaSesion) {
    setErrorConexion('')
    setPestanaActiva('catalogo')
    setSesion(nuevaSesion)
  }

  async function handleCerrarSesion() {
    try {
      await api.cerrarSesion()
    } catch {
      // Aunque falle la petición, la sesión se cierra en el navegador.
    }
    cerrarSesionLocal()
  }

=======
import { useState } from 'react'
import Catalogo from './components/Catalogo'
import Cotizaciones from './components/Cotizaciones'
import Clientes from './components/Clientes'

const PESTANAS = [
  { id: 'catalogo', etiqueta: 'Catálogo' },
  { id: 'cotizaciones', etiqueta: 'Cotizaciones' },
  { id: 'clientes', etiqueta: 'Clientes' },
]

function App() {
  const [pestanaActiva, setPestanaActiva] = useState('catalogo')

  // Todo el estado vive aquí por ahora, ya que aún no hay backend.
  // Cuando se conecte con Django/PostgreSQL, esto pasa a llamadas a la API.
  const [clientes, setClientes] = useState([])
  const [cotizaciones, setCotizaciones] = useState([])
  const [itemsSeleccionados, setItemsSeleccionados] = useState([])

>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
  function agregarMuebleACotizacion(mueble) {
    setItemsSeleccionados((prev) => {
      const existente = prev.find((item) => item.id === mueble.id)
      if (existente) {
        return prev.map((item) =>
          item.id === mueble.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [...prev, { ...mueble, cantidad: 1 }]
    })
    setPestanaActiva('cotizaciones')
  }

  function quitarItemDeCotizacion(id) {
    setItemsSeleccionados((prev) => prev.filter((item) => item.id !== id))
  }

<<<<<<< HEAD
  async function guardarCotizacion(clienteId) {
    const nueva = await api.crearCotizacion({
      cliente_id: clienteId,
      items: itemsSeleccionados.map((item) => ({ mueble_id: item.id, cantidad: item.cantidad })),
    })
    setCotizaciones((prev) => [nueva, ...prev])
    setItemsSeleccionados([])
  }

  async function agregarCliente(datos) {
    const nuevo = await api.crearCliente(datos)
    setClientes((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')))
  }

  async function eliminarCliente(id) {
    await api.eliminarCliente(id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  async function registrarMovimiento(datos) {
    const { movimiento, existencia } = await api.registrarMovimiento(datos)
    setMovimientos((prev) => [movimiento, ...prev])
    setExistencias((prev) => [
      ...prev.filter((e) => !(e.mueble_id === existencia.mueble_id && e.sede === existencia.sede)),
      existencia,
    ])
  }

  // --- Renderizado ---

  if (sesion === null) {
    return (
      <div className="app">
        <p className="ayuda">Verificando sesión…</p>
      </div>
    )
  }

  if (!sesion.autenticado) {
    return (
      <div className="app">
        <header className="encabezado">
          <h1>ERP Famoc</h1>
          <p>Módulo Comercial</p>
        </header>
        <Login errorInicial={errorConexion} onIngresar={handleIngresar} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="encabezado encabezado-fila">
        <div>
          <h1>ERP Famoc</h1>
          <p>Módulo Comercial — conectado a la API de Django</p>
        </div>
        <div className="sesion">
          <span>
            {sesion.nombre} · {sesion.roles.join(', ') || 'sin rol asignado'}
          </span>
          <button onClick={handleCerrarSesion}>Cerrar sesión</button>
        </div>
      </header>

      {pestanasVisibles.length === 0 ? (
        <p className="ayuda">
          Tu usuario no tiene permisos para ver ningún módulo. Pide a un administrador que te asigne un rol.
        </p>
      ) : (
        <>
          <nav className="pestanas">
            {pestanasVisibles.map((pestana) => (
              <button
                key={pestana.id}
                className={pestana.id === pestanaMostrada ? 'pestana activa' : 'pestana'}
                onClick={() => setPestanaActiva(pestana.id)}
              >
                {pestana.etiqueta}
              </button>
            ))}
          </nav>

          <main>
            {pestanaMostrada === 'bitacora' ? (
              <Bitacora registros={bitacora} cargando={cargandoBitacora} onRecargar={cargarBitacora} />
            ) : (
              <>
                {cargando && <p className="ayuda">Cargando datos…</p>}

                {!cargando && errorCarga && (
                  <div className="alerta">
                    <p>{errorCarga}</p>
                    <button onClick={() => cargarDatos(sesion)}>Reintentar</button>
                  </div>
                )}

                {!cargando && !errorCarga && (
                  <>
                    {pestanaMostrada === 'catalogo' && (
                      <Catalogo
                        muebles={muebles}
                        puedeAgregar={puede('famocapp.add_cotizacion')}
                        onAgregar={agregarMuebleACotizacion}
                      />
                    )}
                    {pestanaMostrada === 'cotizaciones' && (
                      <Cotizaciones
                        clientes={clientes}
                        puedeCrear={puede('famocapp.add_cotizacion')}
                        itemsSeleccionados={itemsSeleccionados}
                        onQuitarItem={quitarItemDeCotizacion}
                        cotizaciones={cotizaciones}
                        onGuardarCotizacion={guardarCotizacion}
                      />
                    )}
                    {pestanaMostrada === 'clientes' && (
                      <Clientes
                        clientes={clientes}
                        puedeCrear={puede('famocapp.add_cliente')}
                        puedeEliminar={puede('famocapp.delete_cliente')}
                        onAgregarCliente={agregarCliente}
                        onEliminarCliente={eliminarCliente}
                      />
                    )}
                    {pestanaMostrada === 'inventario' && (
                      <Inventario
                        existencias={existencias}
                        muebles={muebles}
                        movimientos={movimientos}
                        puedeRegistrar={puede('famocapp.add_movimientoinventario')}
                        puedeVerMovimientos={puede('famocapp.view_movimientoinventario')}
                        onRegistrarMovimiento={registrarMovimiento}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </>
      )}
=======
  function guardarCotizacion(cotizacion) {
    setCotizaciones((prev) => [cotizacion, ...prev])
    setItemsSeleccionados([])
  }

  function agregarCliente(cliente) {
    setClientes((prev) => [...prev, cliente])
  }

  function eliminarCliente(id) {
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="app">
      <header className="encabezado">
        <h1>ERP Famoc</h1>
        <p>Módulo Comercial — versión inicial (solo frontend)</p>
      </header>

      <nav className="pestanas">
        {PESTANAS.map((pestana) => (
          <button
            key={pestana.id}
            className={pestana.id === pestanaActiva ? 'pestana activa' : 'pestana'}
            onClick={() => setPestanaActiva(pestana.id)}
          >
            {pestana.etiqueta}
          </button>
        ))}
      </nav>

      <main>
        {pestanaActiva === 'catalogo' && <Catalogo onAgregar={agregarMuebleACotizacion} />}
        {pestanaActiva === 'cotizaciones' && (
          <Cotizaciones
            clientes={clientes}
            itemsSeleccionados={itemsSeleccionados}
            onQuitarItem={quitarItemDeCotizacion}
            cotizaciones={cotizaciones}
            onGuardarCotizacion={guardarCotizacion}
          />
        )}
        {pestanaActiva === 'clientes' && (
          <Clientes
            clientes={clientes}
            onAgregarCliente={agregarCliente}
            onEliminarCliente={eliminarCliente}
          />
        )}
      </main>
>>>>>>> a36f6c2f35f83d7e04bb0f8a9f5950043995571f
    </div>
  )
}

export default App
