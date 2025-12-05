import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import Product from '#models/product'

import { createProductValidator, updateProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'
import fs from 'node:fs/promises'

export default class ProductsController {
  public async index({ view, request }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const perPage = 12
    const search = request.input('search', '')

    let query = Product.query().preload('images')

    if (search) {
      query = query.where('name', 'like', `%${search}%`)
    }

    const products = await query.paginate(page, perPage)

    return view.render('pages/products/index', { products: products.toJSON(), search })
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
    const payload = await request.validateUsing(createProductValidator)

    const product = await Product.create({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      quantity: payload.quantity,
    })

    const image = new Image()
    image.name = `${cuid()}.${payload.image.extname}`
    image.productId = product.id

    await payload.image.move(app.makePath('tmp/uploads'), {
      name: image.name,
    })

    if (payload.image.state === 'moved') {
      await image.save()
      session.flash({ success: `Produto "${product.name}" criado com sucesso!` })
      return response.redirect().toRoute('products.show', { id: product.id })
    } else {
      session.flash({
        error: 'Erro ao processar sua solicitação. Tente novamente.',
      })
      return response.redirect().back()
    }
  }

  public async update({ params, request, response, session }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    const payload = await request.validateUsing(updateProductValidator)

    if (payload.image) {
      await product.load('images')
      const oldImage = product.images.length > 0 ? product.images[0] : null

      const newImageName = `${cuid()}.${payload.image.extname}`
      await payload.image.move(app.makePath('tmp/uploads'), {
        name: newImageName,
        overwrite: true,
      })

      if (payload.image.state === 'moved') {
        if (oldImage) {
          await fs.unlink(app.makePath('tmp/uploads', oldImage.name))
          oldImage.name = newImageName
          await oldImage.save()
        } else {
          await Image.create({
            productId: product.id,
            name: newImageName,
          })
        }
      } else {
        session.flash({
          error: 'Erro ao processar sua solicitação. Tente novamente.',
        })
        return response.redirect().back()
      }
    }

    const { image, ...productData } = payload
    product.merge(productData)

    await product.save()
    session.flash({ success: `Produto "${product.name}" atualizado com sucesso!` })
    return response.redirect().toRoute('products.show', { id: product.id })
  }

  public async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    await product.delete()

    return response.redirect().toRoute('products.index')
  }

  public async addStock({ params, request, response, session }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const quantityToAdd = Number(request.input('quantity', 0))

    if (quantityToAdd > 0) {
      product.quantity += quantityToAdd
      await product.save()
      session.flash({
        success: `Estoque de "${product.name}" aumentado em ${quantityToAdd} unidades!`,
      })
    } else {
      session.flash({ error: 'Informe uma quantidade válida maior que zero.' })
    }

    return response.redirect().back()
  }
}
