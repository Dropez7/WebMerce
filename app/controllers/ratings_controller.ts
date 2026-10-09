import type { HttpContext } from '@adonisjs/core/http'
import Rating from '#models/rating'
import Product from '#models/product'
import { ratingValidator } from '#validators/rating'

export default class RatingsController {
  /** POST /products/:id/rate */
  public async store({ params, request, auth, response, session }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const payload = await request.validateUsing(ratingValidator)

    // evita duplicação de avaliação
    const existing = await Rating.query()
      .where('product_id', product.id)
      .andWhere('user_id', auth.user!.id)
      .first()

    if (existing) {
      await existing.merge(payload).save()
    } else {
      await Rating.create({
        productId: product.id,
        userId: auth.user!.id,
        ...payload,
      })
    }

    session.flash({ success: 'Avaliação salva com sucesso!' })
    return response.redirect().back()
  }

  /** GET /products/:id/ratings */
  public async index({ params }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const ratings = await product.related('ratings').query()
    const avg =
      ratings.reduce((sum, r) => sum + r.score, 0) / (ratings.length || 1)
    return { ratings, average: Number(avg.toFixed(1)) }
  }
}
