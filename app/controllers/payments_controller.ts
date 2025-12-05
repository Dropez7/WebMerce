import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { paymentValidator } from '#validators/payment'
import router from '@adonisjs/core/services/router'
import mail from '@adonisjs/mail/services/main'
import OrderConfirmation from '../mails/order_confirmation.js'

export default class PaymentsController {
  public async show({ params, view, auth }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const currentYear = new Date().getFullYear()
    const user = auth.user
    const initial = {
      cep: user?.postalCode || '',
      street: user?.address || '',
      fullName: user?.fullName || '',
    }

    return view.render('pages/checkout/index', { product, currentYear, initial })
  }

  public async process({ params, request, response, session, auth }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const payload = await request.validateUsing(paymentValidator)

    const quantity = Number(payload.quantity || 1)

    const user = auth.user!

    if (product.quantity < quantity) {
      session.flash({ error: 'Não há itens suficientes em estoque para completar a compra.' })
      return response.redirect().back()
    }

    const paymentSuccess = true

    if (paymentSuccess) {
      product.quantity = product.quantity - quantity
      await product.save()

      const total = product.price * quantity

      const fullAddress =
        `${payload.street}, ${payload.houseNumber}` +
        (payload.complement ? ` - ${payload.complement}` : '') +
        ` - CEP: ${payload.cep}`

      try {
        await mail.send(new OrderConfirmation(user, [{ product, quantity }], total, fullAddress))
        console.log('✅ Email de item único enviado!')
      } catch (error) {
        console.error('Falha ao enviar e-mail:', error)
      }

      const shipping = {
        cep: payload.cep,
        street: payload.street,
        houseNumber: payload.houseNumber,
        complement: payload.complement || null,
        reference: payload.reference || null,
        cpf: payload.cpf,
      }

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

  public async checkoutCart({ view, session, response, auth }: HttpContext) {
    const cart = session.get('cart', {})
    const productIds = Object.keys(cart)

    if (productIds.length === 0) {
      session.flash({ error: 'Seu carrinho está vazio!' })
      return response.redirect().toRoute('products.index')
    }

    const products = await Product.findMany(productIds)

    let total = 0
    let totalQuantity = 0

    const items = products.map((product) => {
      const quantity = cart[product.id]
      const subtotal = product.price * quantity

      total += subtotal
      totalQuantity += quantity

      return {
        product,
        quantity,
        subtotal,
      }
    })

    const dummyProduct = {
      id: 'cart',
      name: `Carrinho (${totalQuantity} itens)`,
      price: total,
      description: 'Compra de múltiplos itens do carrinho.',
      quantity: 1,
    }

    const currentYear = new Date().getFullYear()

    const user = auth.user
    const initial = {
      cep: user?.postalCode || '',
      street: user?.address || '',
      fullName: user?.fullName || '',
    }

    return view.render('pages/checkout/index', {
      product: dummyProduct,
      items,
      total,
      currentYear,
      isCart: true,
      formAction: router.makeUrl('checkout.cart_process'),
      initial,
    })
  }

  public async processCart({ request, response, session, auth }: HttpContext) {
    const payload = await request.validateUsing(paymentValidator)
    const cart = session.get('cart', {})
    const productIds = Object.keys(cart)

    if (productIds.length === 0) {
      return response.redirect().toRoute('products.index')
    }

    const products = await Product.findMany(productIds)

    // 1. Validar Estoque de TODOS os itens antes de processar
    for (const product of products) {
      const cartQty = cart[product.id]
      if (product.quantity < cartQty) {
        session.flash({ error: `Estoque insuficiente para o produto "${product.name}".` })
        return response.redirect().back()
      }
    }

    // 2. Processar Pagamento (Simulado)
    const paymentSuccess = true

    if (paymentSuccess) {
      let totalPaid = 0
      const user = auth.user!

      const fullAddress =
        `${payload.street}, ${payload.houseNumber}` +
        (payload.complement ? ` - ${payload.complement}` : '') +
        ` - CEP: ${payload.cep}`

      // 1. Cria uma lista para guardar os itens comprados
      const purchasedItems: { product: Product; quantity: number }[] = []

      for (const product of products) {
        const cartQty = cart[product.id]

        product.quantity = product.quantity - cartQty
        await product.save()

        totalPaid += product.price * cartQty

        // Adiciona na lista (NÃO envia email aqui dentro)
        purchasedItems.push({ product, quantity: cartQty })
      }

      // 2. AGORA sim, envia UM ÚNICO email com a lista toda
      try {
        await mail.send(new OrderConfirmation(user, purchasedItems, totalPaid, fullAddress))
        console.log(`✅ Email único enviado com ${purchasedItems.length} itens.`)
      } catch (error) {
        console.error(`❌ Erro ao enviar email:`, error)
      }

      // Resto da lógica (Shipping, Session, Redirect)...
      const shipping = {
        cep: payload.cep,
        street: payload.street,
        houseNumber: payload.houseNumber,
        complement: payload.complement || null,
        reference: payload.reference || null,
        cpf: payload.cpf,
      }

      session.put('lastOrder', {
        success: true,
        productId: null,
        productName: 'Compra do Carrinho',
        quantity: Object.values(cart).reduce((a: any, b: any) => a + b, 0),
        unitPrice: totalPaid,
        total: Number(totalPaid.toFixed(2)),
        shipping,
      })

      session.forget('cart')
      return response.redirect().toRoute('checkout.result', { id: 'cart' })
    }

    session.put('lastOrder', { success: false, reason: 'Falha ao processar pagamento.' })
    return response.redirect().toRoute('checkout.result', { id: 'cart' })
  }

  public async result({ params, view, session, response }: HttpContext) {
    const order = session.get('lastOrder')
    session.forget('lastOrder')

    if (!order) {
      return response.redirect().toRoute('products.show', { id: params.id })
    }
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
