import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import Product from '#models/product'
import User from '#models/user'

export default class OrderConfirmation extends BaseMail {
  subject = 'Seu pedido foi confirmado! 🤘'

  constructor(
    private user: User,
    private items: { product: Product; quantity: number }[],
    private total: number,
    private shippingAddress: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.user.email)
    this.message.from(env.get('FROM_EMAIL') || 'onboarding@resend.dev')

    const rows = this.items
      .map((item) => {
        const subtotal = (item.product.price * item.quantity).toFixed(2).replace('.', ',')
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${subtotal}</td>
          </tr>
        `
      })
      .join('')

    const totalFormatted = this.total.toFixed(2).replace('.', ',')

    this.message.html(`
      <div style="font-family: sans-serif; color: #333;">
        <h1>Parabéns, ${this.user.fullName}! 🎸</h1>
        <p>Seu pedido com <strong>${this.items.length} item(ns)</strong> foi confirmado.</p>
        
        <div style="border: 1px solid #ccc; border-radius: 8px; overflow: hidden; margin: 20px 0;">
          <h3 style="background-color: #222; color: #fff; margin: 0; padding: 15px;">Resumo do Pedido</h3>
          
          <table style="width: 100%; border-collapse: collapse; background-color: #f9f9f9;">
            <thead>
              <tr style="background-color: #eee;">
                <th style="padding: 10px; text-align: left;">Produto</th>
                <th style="padding: 10px; text-align: center;">Qtd</th>
                <th style="padding: 10px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          
          <div style="padding: 15px; text-align: right; background-color: #e2e2e2; font-size: 1.2em;">
            <strong>Total Geral: R$ ${totalFormatted}</strong>
          </div>
        </div>

        <p>Seu pedido será enviado para:</p>
        <p style="background: #fff; border: 1px dashed #999; padding: 15px; font-size: 1.1em;">
          <strong>${this.shippingAddress}</strong>
        </p>

        <p><em>Keep Rocking!</em></p>
      </div>
    `)
  }
}
