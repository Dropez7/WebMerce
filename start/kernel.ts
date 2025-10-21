/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

/**
 * Middlewares globais (rodam sempre)
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/static/static_middleware'),
  () => import('@adonisjs/vite/vite_middleware'),

  // ⚙️ Sessão e autenticação precisam vir AQUI (no server)
  () => import('@adonisjs/session/session_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
])

/**
 * Middlewares que rodam apenas quando há rota correspondente
 */
router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('@adonisjs/shield/shield_middleware'),
])

/**
 * Middlewares nomeados (usados manualmente nas rotas)
 */
export const middleware = router.named({
  guest: () => import('#middleware/guest_middleware'),
  auth: () => import('#middleware/auth_middleware'),
})
