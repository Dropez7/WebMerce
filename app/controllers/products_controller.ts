import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import Product from '#models/product'

import { createProductValidator, updateProductValidator } from '#validators/product'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'
import fs from 'node:fs/promises'

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

    if (payload.image.state === 'moved') {
      await image.save()
      console.log('Produto criado:', product.toJSON())
      console.log('Imagem salva:', image.toJSON())
      // Adicionar a mensagem flash ANTES do redirect
      session.flash({ success: `Produto "${product.name}" criado com sucesso!` })
      return response.redirect().toRoute('products.show', { id: product.id })
    } else {
      console.error('Erro ao mover imagem:', payload.image.errors)
      session.flash({
        error: `Erro ao fazer upload da imagem: ${payload.image.errors[0]?.message || 'Erro desconhecido'}`,
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
          try {
            await fs.unlink(app.makePath('tmp/uploads', oldImage.name))
            oldImage.name = newImageName
            await oldImage.save()
            console.log('Imagem antiga apagada e registo atualizado:', oldImage.name)
          } catch (error) {
            console.error('Erro ao apagar imagem antiga ou atualizar registo:', error)
          }
        } else {
          await Image.create({
            productId: product.id,
            name: newImageName,
          })
          console.log('Nova imagem criada:', newImageName)
        }
      } else {
        console.error('Erro ao mover nova imagem:', payload.image.errors)
        session.flash({
          error: `Erro ao fazer upload da nova imagem: ${payload.image.errors[0]?.message || 'Erro desconhecido'}`,
        })
        return response.redirect().back()
      }
    }

    const { image, ...productData } = payload
    product.merge(productData)

    try {
      await product.save()
      session.flash({ success: `Produto "${product.name}" atualizado com sucesso!` })
      return response.redirect().toRoute('products.show', { id: product.id })
    } catch (dbError) {
      console.error('Erro ao salvar produto:', dbError)
      session.flash({ error: `Erro ao salvar as alterações do produto: ${dbError.message}` })
      return response.redirect().back()
    }
  }

  public async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)

    await product.delete()

    return response.redirect().toRoute('products.index')
  }
}
