import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import Image from '#models/image'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'

export default class extends BaseSeeder {
  async run() {
    await Product.query().delete()

    const products = [
      {
        name: 'Camisa Preta Guns N Roses',
        description: 'Camisa Guns N Roses Logo de Rock Unissex 100% Algodão.',
        price: 89.9,
        quantity: 50,
        imageFileName: 'guns.jpeg',
      },
      {
        name: 'Camiseta Red Hot Chili Peppers Pretar',
        description:
          'A Camiseta Red Hot Chili Peppers é feita em tecido de algodão, macio e confortável. Além da alta qualidade do material, a resolução da estampa em silk screen é perfeita. É muito estilo e atitude em uma peça só.',
        price: 79.99,
        quantity: 10,
        imageFileName: 'rhcp.jpg',
      },
      {
        name: 'Camisa Banda Aerosmith',
        description: 'Camisa Tradicional Rock Aerosmith Banda de Rock Algodão Unissex.',
        price: 99.9,
        quantity: 15,
        imageFileName: 'camisa_aerosmith.jpg',
      },
      {
        name: 'Moletom Preto Bnada Queen',
        description: 'Moletom preto Banda Queen. Possui capuz e é bem quente. Unissex.',
        price: 199.99,
        quantity: 8,
        imageFileName: 'queen.png',
      },
      {
        name: 'Camisa Preta Banda Pearl Jam - Black',
        description: 'Camisa da Banda Pearl Jam na cor Preta. Música Black.',
        price: 79.9,
        quantity: 20,
        imageFileName: 'black_pearl.jpeg',
      },
      {
        name: 'Camisa Preta Tradicional Green Day',
        description: 'Camisa preta banda Green Day. Estampa American Idiot.',
        price: 69.99,
        quantity: 12,
        imageFileName: 'green_day.jpeg',
      },
      {
        name: 'Camisa The Police Preta - Unissex',
        description: 'Camisa Preta da Banda The Police com detalhes coloridos. Unissex.',
        price: 60.9,
        quantity: 30,
        imageFileName: 'the_police.jpeg',
      },
      {
        name: 'Camisa Preta Simples - Creed',
        description: 'Camisa Preta Bnada Creed feirta de algodão. Detalhes em branco.',
        price: 70.9,
        quantity: 25,
        imageFileName: 'camisa_creed.jpeg',
      },
      {
        name: 'Caneca Preta - Nirvana',
        description:
          'Caneca Preta Banda Nirvana. Material Louça. Resistente. Mentém a temperatura.',
        price: 25.9,
        quantity: 40,
        imageFileName: 'nirvana.jpeg',
      },
      {
        name: 'Moletom Preto Banda Kiss',
        description: 'Moletom Preto Banda Kiss com capuz. Detalhes em vermelho.',
        price: 229.9,
        quantity: 100,
        imageFileName: 'kiss.jpeg',
      },
    ]

    for (const productData of products) {
      const { imageFileName, ...productFields } = productData
      const product = await Product.create(productFields)

      if (imageFileName) {
        const publicImagePath = app.makePath('public', 'products', imageFileName)
        const tmpImagePath = app.makePath('tmp/uploads', imageFileName)

        const imageExistsInPublic = fs.existsSync(publicImagePath)
        const imageExistsInTmp = fs.existsSync(tmpImagePath)

        if (imageExistsInPublic || imageExistsInTmp) {
          await Image.create({
            name: imageFileName,
            productId: product.id,
          })
        }
      }
    }
  }
}
