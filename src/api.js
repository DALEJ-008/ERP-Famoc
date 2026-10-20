// Cliente HTTP para la API de Django (prefijo /api, con proxy en Vite).
// Las escrituras envían la cookie csrftoken en la cabecera X-CSRFToken.

const BASE_URL = '/api'

function leerCookie(nombre) {
  const coincidencia = document.cookie.match(new RegExp(`(?:^|; )${nombre}=([^;]*)`))
  return coincidencia ? decodeURIComponent(coincidencia[1]) : ''
}

async function peticion(ruta, { method = 'GET', body } = {}) {
  const cabeceras = {}
  if (body !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (method !== 'GET') cabeceras['X-CSRFToken'] = leerCookie('csrftoken')

  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method,
      credentials: 'same-origin',
      headers: cabeceras,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que Django esté corriendo en el puerto 8000.')
  }

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    // Django responde 403 con HTML cuando falla la protección CSRF (sesión vencida, por ejemplo).
    const mensaje =
      datos?.error ||
      (respuesta.status === 403
        ? 'La petición fue rechazada por seguridad. Recarga la página e inténtalo de nuevo.'
        : `El servidor respondió con error ${respuesta.status}.`)
    const error = new Error(mensaje)
    error.status = respuesta.status
    throw error
  }
  return datos
}

// Sesión
export const obtenerSesion = () => peticion('/sesion/')
export const iniciarSesion = (usuario, clave) => peticion('/login/', { method: 'POST', body: { usuario, clave } })
export const cerrarSesion = () => peticion('/logout/', { method: 'POST' })

// Datos
export const obtenerMuebles = () => peticion('/muebles/')
export const obtenerClientes = () => peticion('/clientes/')
export const crearCliente = (cliente) => peticion('/clientes/', { method: 'POST', body: cliente })
export const eliminarCliente = (id) => peticion(`/clientes/${id}/`, { method: 'DELETE' })
export const obtenerCotizaciones = () => peticion('/cotizaciones/')
export const crearCotizacion = (cotizacion) => peticion('/cotizaciones/', { method: 'POST', body: cotizacion })
export const obtenerBitacora = () => peticion('/bitacora/')

// Inventario
export const obtenerExistencias = () => peticion('/inventario/')
export const obtenerMovimientos = () => peticion('/movimientos/')
export const registrarMovimiento = (movimiento) => peticion('/movimientos/', { method: 'POST', body: movimiento })
