// Gráficas y diagramas en SVG puro (sin librerías externas).
// Los colores vienen de las variables CSS de App.css.

const PALETA = ['var(--verde)', 'var(--acento)', 'var(--verde-oscuro)', 'var(--arena-oscura)', 'var(--verde-claro)', 'var(--gris)']

function SinDatos({ texto = 'Sin datos para mostrar.' }) {
  return <p className="ayuda grafico-vacio">{texto}</p>
}

// Barras verticales, una por categoría.
export function BarrasVerticales({ datos, formatoValor = (v) => v.toLocaleString('es-CO') }) {
  if (datos.length === 0 || datos.every((d) => d.valor === 0)) return <SinDatos />

  const ancho = 520
  const alto = 240
  const margenSuperior = 28
  const margenInferior = 36
  const areaAlto = alto - margenSuperior - margenInferior
  const max = Math.max(...datos.map((d) => d.valor), 1)
  const paso = ancho / datos.length
  const anchoBarra = Math.min(56, paso * 0.6)

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="grafico" role="img" aria-label="Gráfica de barras">
      <line x1="0" x2={ancho} y1={alto - margenInferior} y2={alto - margenInferior} className="eje" />
      {datos.map((d, i) => {
        const altura = (d.valor / max) * areaAlto
        const x = i * paso + (paso - anchoBarra) / 2
        const y = alto - margenInferior - altura
        return (
          <g key={d.etiqueta}>
            <rect x={x} y={y} width={anchoBarra} height={altura} rx="5" style={{ fill: PALETA[0] }}>
              <title>{`${d.etiqueta}: ${formatoValor(d.valor)}`}</title>
            </rect>
            <text x={x + anchoBarra / 2} y={y - 7} textAnchor="middle" className="grafico-valor">
              {formatoValor(d.valor)}
            </text>
            <text x={i * paso + paso / 2} y={alto - 12} textAnchor="middle" className="grafico-etiqueta">
              {d.etiqueta}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Dona con leyenda: muestra la proporción de cada categoría.
export function Dona({ datos }) {
  const total = datos.reduce((suma, d) => suma + d.valor, 0)
  if (total === 0) return <SinDatos />

  const radio = 60
  const circunferencia = 2 * Math.PI * radio
  let acumulado = 0

  return (
    <div className="dona">
      <svg viewBox="0 0 160 160" className="grafico-dona" role="img" aria-label="Gráfica de dona">
        <circle cx="80" cy="80" r={radio} className="dona-fondo" />
        {datos.map((d, i) => {
          const longitud = (d.valor / total) * circunferencia
          const desplazamiento = -acumulado
          acumulado += longitud
          return (
            <circle
              key={d.etiqueta}
              cx="80"
              cy="80"
              r={radio}
              fill="none"
              strokeWidth="26"
              style={{ stroke: PALETA[i % PALETA.length] }}
              strokeDasharray={`${longitud} ${circunferencia - longitud}`}
              strokeDashoffset={desplazamiento}
              transform="rotate(-90 80 80)"
            />
          )
        })}
        <text x="80" y="88" textAnchor="middle" className="grafico-centro">
          {total}
        </text>
      </svg>
      <ul className="leyenda">
        {datos.map((d, i) => (
          <li key={d.etiqueta}>
            <span className="punto" style={{ background: PALETA[i % PALETA.length] }} />
            {d.etiqueta}: <strong>{d.valor}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Barras horizontales: útil para rankings.
export function BarrasHorizontales({ datos, formatoValor = (v) => v.toLocaleString('es-CO') }) {
  if (datos.length === 0) return <SinDatos />
  const max = Math.max(...datos.map((d) => d.valor), 1)

  return (
    <ul className="barras-h">
      {datos.map((d, i) => (
        <li key={d.etiqueta}>
          <div className="barras-h-texto">
            <span>{d.etiqueta}</span>
            <strong>{formatoValor(d.valor)}</strong>
          </div>
          <div className="barras-h-pista">
            <div
              className="barras-h-relleno"
              style={{ width: `${(d.valor / max) * 100}%`, background: PALETA[i % PALETA.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

const PASOS_FLUJO = ['Cliente', 'Catálogo', 'Cotización', 'Inventario', 'Venta']

// Diagrama de flujo del proceso comercial. "Venta" aún no está desarrollada.
export function FlujoComercial() {
  const ancho = 640
  const alto = 116
  const ancho_nodo = 104
  const separacion = 22

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="grafico" role="img" aria-label="Diagrama del flujo comercial">
      <defs>
        <marker id="punta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="punta" />
        </marker>
      </defs>
      {PASOS_FLUJO.map((paso, i) => {
        const x = 8 + i * (ancho_nodo + separacion)
        const pendiente = paso === 'Venta'
        return (
          <g key={paso}>
            <rect
              x={x}
              y="26"
              width={ancho_nodo}
              height="50"
              rx="10"
              className={pendiente ? 'nodo-pendiente' : 'nodo-activo'}
            />
            <text x={x + ancho_nodo / 2} y="56" textAnchor="middle" className={pendiente ? 'nodo-texto-oscuro nodo-texto' : 'nodo-texto'}>
              {paso}
            </text>
            {i < PASOS_FLUJO.length - 1 && (
              <line x1={x + ancho_nodo} y1="51" x2={x + ancho_nodo + separacion} y2="51" className="flecha" />
            )}
          </g>
        )
      })}
      <text x={ancho / 2} y="104" textAnchor="middle" className="grafico-etiqueta">
        Verde: activo · Beige con borde punteado: pendiente de desarrollo
      </text>
    </svg>
  )
}

const MODULOS_ERP = [
  { nombre: 'Comercial', estado: 'activo' },
  { nombre: 'Inventarios', estado: 'activo' },
  { nombre: 'Producción', estado: 'pendiente' },
  { nombre: 'Contabilidad', estado: 'pendiente' },
  { nombre: 'Administración', estado: 'pendiente' },
  { nombre: 'Alquileres', estado: 'pendiente' },
]

// Mapa de módulos del ERP alrededor del núcleo, con su estado de avance.
export function MapaModulos() {
  const cx = 300
  const cy = 190
  const rx = 200
  const ry = 130

  const nodos = MODULOS_ERP.map((m, i) => {
    const angulo = ((-90 + i * 60) * Math.PI) / 180
    return { ...m, x: cx + rx * Math.cos(angulo), y: cy + ry * Math.sin(angulo) }
  })

  return (
    <svg viewBox="0 0 600 370" className="grafico" role="img" aria-label="Mapa de módulos del ERP">
      {nodos.map((n) => (
        <line key={`radio-${n.nombre}`} x1={cx} y1={cy} x2={n.x} y2={n.y} className="radio" />
      ))}
      <circle cx={cx} cy={cy} r="56" className="hub" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="hub-texto">ERP</text>
      <text x={cx} y={cy + 16} textAnchor="middle" className="hub-texto">Famoc</text>

      {nodos.map((n) => (
        <g key={n.nombre}>
          <rect
            x={n.x - 70}
            y={n.y - 22}
            width="140"
            height="44"
            rx="22"
            className={n.estado === 'activo' ? 'nodo-modulo-activo' : 'nodo-modulo-pendiente'}
          />
          <text x={n.x} y={n.y - 3} textAnchor="middle" className="nodo-modulo-titulo">{n.nombre}</text>
          <text x={n.x} y={n.y + 13} textAnchor="middle" className="nodo-modulo-estado">
            {n.estado === 'activo' ? 'Activo' : 'Pendiente'}
          </text>
        </g>
      ))}
    </svg>
  )
}
