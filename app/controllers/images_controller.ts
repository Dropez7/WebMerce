import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'
import fs from 'node:fs'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'

export default class ImagesController {
  public async show({ params, response }: HttpContext) {
    const image = await Image.query().where('name', params.name).first()

    if (image) {
      const publicImagePath = join(app.appRoot.toString(), 'public', 'products', params.name)
      const tmpImagePath = app.makePath('tmp/uploads', params.name)

      let imagePath: string | null = null

      if (fs.existsSync(publicImagePath)) {
        imagePath = publicImagePath
      } else if (fs.existsSync(tmpImagePath)) {
        imagePath = tmpImagePath
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
    }
    return response.notFound('Imagem não encontrada')
  }

  public async showAvatar({ params, response }: HttpContext) {
    const filename = params.filename
    const avatarPath = app.makePath('tmp/avatars', filename)

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
  }
}
