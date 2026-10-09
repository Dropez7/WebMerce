import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { existsSync } from 'node:fs'

export default class ImagesController {
  /** Servir imagem de produto sem tocar no banco de dados */
  public async show({ params, response }: HttpContext) {
    const filename = params.name
    let imagePath: string | null = null

    try {
      const publicPath = app.publicPath('products', filename)
      const tmpPath = app.makePath('tmp/uploads', filename)

      if (existsSync(publicPath)) {
        imagePath = publicPath
      } else if (existsSync(tmpPath)) {
        imagePath = tmpPath
      }
    } catch {
      // Ignora erros de sistema de arquivos em ambiente serverless
    }

    if (imagePath) {
      return response.download(imagePath)
    }

    // Placeholder SVG limpo caso a imagem não exista
    const placeholder = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#ddd" width="200" height="200"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#555" font-family="sans-serif" font-size="16">Imagem não encontrada</text>
    </svg>`

    response.type('image/svg+xml')
    return response.send(placeholder)
  }

  /** Servir avatar do perfil sem tocar no banco de dados */
public async showAvatar({ params, response }: HttpContext) {
  const filename = params.filename

  // Se já for uma URL completa HTTP/HTTPS, redireciona direto
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return response.redirect(filename)
  }

  // Se for apenas o nome do arquivo, gera a URL pública do Supabase
  const supabaseUrl = process.env.SUPABASE_URL
  if (supabaseUrl) {
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filename}`
    return response.redirect(publicUrl)
  }

  const placeholder = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#ddd" width="200" height="200"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#555" font-family="sans-serif" font-size="16">Avatar não encontrado</text>
  </svg>`

  response.type('image/svg+xml')
  return response.send(placeholder)
}
}