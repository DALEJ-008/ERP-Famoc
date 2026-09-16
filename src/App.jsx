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
    </div>
  )
}

export default App
