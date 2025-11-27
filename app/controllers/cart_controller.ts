import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'

export default class CartController {
  // Exibir o carrinho
  public async index({ view, session }: HttpContext) {
    const cart = session.get('cart', {})
    const productIds = Object.keys(cart)

    // Buscar detalhes dos produtos que estão na sessão
    const products = await Product.query().whereIn('id', productIds).preload('images')

    // Calcular totais e formatar dados para a view
    let total = 0
    const items = products.map((product) => {
      const quantity = cart[product.id]
      const subtotal = product.price * quantity
      total += subtotal
      return {
        product,
        quantity,
        subtotal,
      }
    })

    return view.render('pages/cart/index', { items, total })
  }

  // Adicionar item ao carrinho
  public async store({ request, session, response }: HttpContext) {
    const { productId, quantity } = request.only(['productId', 'quantity'])
    const qty = Number(quantity || 1)

    // Validar se o produto existe e tem estoque
    const product = await Product.find(productId)
    if (!product) {
      session.flash({ error: 'Produto não encontrado.' })
      return response.redirect().back()
    }

    if (product.quantity < qty) {
      session.flash({ error: 'Estoque insuficiente.' })
      return response.redirect().back()
    }

    // Obter carrinho atual
    const cart = session.get('cart', {})

    // Atualizar quantidade se já existir, ou criar novo
    if (cart[productId]) {
      cart[productId] += qty
    } else {
      cart[productId] = qty
    }

    session.put('cart', cart)
    session.flash({ success: 'Item adicionado ao carrinho!' })

    return response.redirect().toRoute('cart.index')
  }

  // Remover item do carrinho
  public async destroy({ params, session, response }: HttpContext) {
    const productId = params.id
    const cart = session.get('cart', {})

    if (cart[productId]) {
      delete cart[productId]
    }

    session.put('cart', cart)
    session.flash({ success: 'Item removido do carrinho.' })

    return response.redirect().back()
  }
}
