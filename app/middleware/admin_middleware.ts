import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Check if user is authenticated
     */
    if (!ctx.auth.user) {
      return ctx.response.redirect().toRoute('login.show')
    }

    /**
     * Check if user is admin
     */
    if (!ctx.auth.user.isAdmin()) {
      ctx.session.flash({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' })
      return ctx.response.redirect().toRoute('products.index')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}