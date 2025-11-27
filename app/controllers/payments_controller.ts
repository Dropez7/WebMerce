import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { paymentValidator } from '#validators/payment'

export default class PaymentsController {
  public async show({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const currentYear = new Date().getFullYear()
    return view.render('pages/checkout/index', { product, currentYear })
  }

  public async process({ params, request, response, session }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const payload = await request.validateUsing(paymentValidator)

    const quantity = Number(payload.quantity || 1)

    if (product.quantity < quantity) {
      session.flash({ error: 'Não há itens suficientes em estoque para completar a compra.' })
      return response.redirect().back()
    }

    // Simulate payment processing here. In a real app you would call a gateway.
    const paymentSuccess = true

    if (paymentSuccess) {
      product.quantity = product.quantity - quantity
      await product.save()

      // include shipping info from payload when storing lastOrder
      const shipping = {
        cep: payload.cep,
        street: payload.street,
        houseNumber: payload.houseNumber,
        complement: payload.complement || null,
        reference: payload.reference || null,
        cpf: payload.cpf,
      }

      // store order details in session to show on result page
      session.put('lastOrder', {
        success: true,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: Number((product.price * quantity).toFixed(2)),
        shipping,
      })

      return response.redirect().toRoute('checkout.result', { id: product.id })
    }

    session.put('lastOrder', { success: false, reason: 'Falha ao processar pagamento.' })
    return response.redirect().toRoute('checkout.result', { id: product.id })
  }

  public async result({ params, view, session, response }: HttpContext) {
    const order = session.get('lastOrder')
    // clear it so refresh won't show it again
    session.forget('lastOrder')

    if (!order) {
      // If no order info, redirect back to product page
      return response.redirect().toRoute('products.show', { id: params.id })
    }
    // load product (with images) to show thumbnail on result page
    let product = null
    if (order.productId) {
      product = await Product.find(order.productId)
      if (product) {
        await product.load('images')
      }
    }

    return view.render('pages/checkout/result', { order, product })
  }
}
