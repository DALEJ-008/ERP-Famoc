import { BarrasHorizontales, BarrasVerticales, Dona, FlujoComercial, MapaModulos } from './Graficos'

const SEDES = ['Bogotá', 'Medellín', 'Barranquilla', 'Miami']

function claveMes(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
}

// Últimos n meses, del más antiguo al más reciente.
function ultimosMeses(n) {
  const hoy = new Date()
  return Array.from({ length: n }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (n - 1 - i), 1)
    return {
      clave: claveMes(fecha),
      etiqueta: fecha.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
    }
  })
}

function formatoCOP(valor) {
  return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

function formatoMillones(valor) {
  if (valor >= 1_000_000) {
    return `$${(valor / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`
  }
  return formatoCOP(valor)
}

// Vista general del sistema. Cada gráfica usa solo los datos que el usuario puede consultar.
function Resumen({ clientes, cotizaciones, existencias }) {
  const totalCotizado = cotizaciones.reduce((suma, c) => suma + c.total, 0)
  const unidadesEnStock = existencias.reduce((suma, e) => suma + e.cantidad, 0)

  const cotizadoPorMes = ultimosMeses(6).map((mes) => ({
    etiqueta: mes.etiqueta,
    valor: cotizaciones
      .filter((c) => claveMes(new Date(c.fecha)) === mes.clave)
      .reduce((suma, c) => suma + c.total, 0),
  }))

  const porCiudad = {}
  clientes.forEach((c) => {
    const ciudad = c.ciudad || 'Sin sede'
    porCiudad[ciudad] = (porCiudad[ciudad] || 0) + 1
  })
  const datosClientes = Object.entries(porCiudad).map(([etiqueta, valor]) => ({ etiqueta, valor }))

  const stockPorSede = SEDES.map((sede) => ({
    etiqueta: sede,
    valor: existencias.filter((e) => e.sede === sede).reduce((suma, e) => suma + e.cantidad, 0),
  }))

  const stockPorMueble = {}
  existencias.forEach((e) => {
    stockPorMueble[e.mueble] = (stockPorMueble[e.mueble] || 0) + e.cantidad
  })
  const topMuebles = Object.entries(stockPorMueble)
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .filter((m) => m.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)

  return (
    <>
      <div className="kpis">
        <div className="kpi">
          <strong>{clientes.length}</strong>
          <small>Clientes registrados</small>
        </div>
        <div className="kpi">
          <strong>{cotizaciones.length}</strong>
          <small>Cotizaciones</small>
        </div>
        <div className="kpi">
          <strong>{formatoMillones(totalCotizado)}</strong>
          <small>Valor cotizado</small>
        </div>
        <div className="kpi">
          <strong>{unidadesEnStock.toLocaleString('es-CO')}</strong>
          <small>Unidades en stock</small>
        </div>
      </div>

      <div className="grid-resumen">
        <div className="panel">
          <h2>Valor cotizado (últimos 6 meses)</h2>
          <BarrasVerticales datos={cotizadoPorMes} formatoValor={formatoMillones} />
        </div>

        <div className="panel">
          <h2>Clientes por sede</h2>
          <Dona datos={datosClientes} />
        </div>

        <div className="panel">
          <h2>Stock por sede</h2>
          <BarrasVerticales datos={stockPorSede} />
        </div>

        <div className="panel">
          <h2>Muebles con más stock</h2>
          <BarrasHorizontales datos={topMuebles} />
        </div>

        <div className="panel ancho-completo">
          <h2>Flujo comercial</h2>
          <FlujoComercial />
        </div>

        <div className="panel ancho-completo">
          <h2>Mapa del ERP</h2>
          <MapaModulos />
        </div>
      </div>
    </>
  )
}

export default Resumen
