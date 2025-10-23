import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import Product from '#models/product'

import { createProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'

export default class ProductsController {
  public async index({ view }: HttpContext) {
    const products = await Product.query().preload('images')

    return view.render('pages/products/index', { products })
  }

  public async show({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.load('images')

    return view.render('pages/products/show', { product })
  }

  public async create({ view }: HttpContext) {
    return view.render('pages/products/create')
  }

  public async edit({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    return view.render('pages/products/create', { product })
  }

  public async store({ request, response, session }: HttpContext) {
    console.log('Iniciando criação de produto...')
    // Adicionar 'session'
    const payload = await request.validateUsing(createProductValidator)

    const product = await Product.create({
      name: payload.name,
      description: payload.description,
      price: payload.price,
    })
    console.log('oia so')
    const image = new Image()
    image.name = `${cuid()}.${payload.image.extname}`
    image.productId = product.id

    console.log('vai entrar ali')

    await payload.image.move(app.makePath('tmp/uploads'), {
      name: image.name,
    })

    console.log('passou dali')

    // Verificar se a imagem foi movida com sucesso antes de salvar
    if (payload.image.state === 'moved') {
      await image.save()
      console.log('Produto criado:', product.toJSON())
      console.log('Imagem salva:', image.toJSON())
      // Adicionar a mensagem flash ANTES do redirect
      session.flash({ success: `Produto "${product.name}" criado com sucesso!` })
      return response.redirect().toRoute('products.show', { id: product.id })
    } else {
      // Se houve erro ao mover a imagem, mostrar erro e voltar
      // Opcional: Poderia tentar apagar o produto que foi criado sem imagem
      // await product.delete()
      console.error('Erro ao mover imagem:', payload.image.errors)
      session.flash({
        error: `Erro ao fazer upload da imagem: ${payload.image.errors[0]?.message || 'Erro desconhecido'}`,
      })
      return response.redirect().back() // Voltar para o formulário
    }
  }

  public async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const payload = await request.validateUsing(createProductValidator)

    product.merge(payload)
    await product.save()

    return response.redirect().toRoute('products.show', { id: product.id })
  }

  public async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    await product.delete()

    return response.redirect().toRoute('products.index')
  }
}
