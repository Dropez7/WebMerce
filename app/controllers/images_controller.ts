import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'
import { createReadStream } from 'node:fs'

export default class ImagesController {
  public async show({ params, response }: HttpContext) {
    let imagePath: string | null = null

    try {
      const publicImagePath = app.publicPath('products', params.name)
      const tmpImagePath = app.makePath('tmp/uploads', params.name)

      if (fs.existsSync(publicImagePath)) {
        imagePath = publicImagePath
      } else if (fs.existsSync(tmpImagePath)) {
        imagePath = tmpImagePath
      }
    } catch {
      // Em ambientes serverless o acesso ao FS pode ser restrito
    }

    if (imagePath) {
      const ext = params.name.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      }
      const contentType = mimeTypes[ext || ''] || 'image/jpeg'

      response.type(contentType)
      return response.stream(createReadStream(imagePath))
    }

    const placeholder = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#ddd" width="200" height="200"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#555" font-family="sans-serif" font-size="16">
        Imagem não encontrada
      </text>
    </svg>`
    response.type('image/svg+xml')
    return response.send(placeholder)
  }

  public async showAvatar({ params, response }: HttpContext) {
    const filename = params.filename
    const avatarPath = app.makePath('tmp/avatars', filename)

    try {
      await fs.promises.access(avatarPath, fs.constants.R_OK)

      const ext = filename.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      }
      const contentType = mimeTypes[ext || ''] || 'image/jpeg'

      response.type(contentType)
      return response.stream(createReadStream(avatarPath))
    } catch {
      const placeholder = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect fill="#ddd" width="200" height="200"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#555" font-family="sans-serif" font-size="16">
          Avatar não encontrado
        </text>
      </svg>`
      response.type('image/svg+xml')
      return response.send(placeholder)
    }
  }
}