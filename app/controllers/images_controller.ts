// app/controllers/images_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import Image from '#models/image'
import fs from 'node:fs' // Importar fs para verificar existência

export default class ImagesController {
  // Método existente para imagens de produto
  public async show({ params, response }: HttpContext) {
    // A query ao banco de dados não é estritamente necessária se apenas servimos o ficheiro,
    // mas pode ser útil para verificar se a imagem pertence a um produto válido.
    // Mantendo a lógica original por enquanto:
    const image = await Image.query().where('name', params.name).first() // Usar first() para obter um único resultado

    if (image) {
      const imagePath = app.makePath('tmp/uploads', params.name)
      // Verificar se o ficheiro existe antes de tentar enviar
      if (fs.existsSync(imagePath)) {
        return response.download(imagePath)
      }
    }
    // Retornar 404 se a imagem não for encontrada no DB ou o ficheiro não existir
    return response.notFound('Imagem não encontrada')
  }

  // Novo método para avatares
  public async showAvatar({ params, response }: HttpContext) {
    // Aqui, não precisamos (nem devemos) verificar na tabela Images
    // Assumimos que o filename vem da coluna `avatar_filename` do User
    const filename = params.filename
    const avatarPath = app.makePath('tmp/avatars', filename)

    // Verificar se o ficheiro existe
    try {
      await fs.promises.access(avatarPath, fs.constants.R_OK) // Verifica existência e permissão de leitura
      return response.download(avatarPath) // Envia o ficheiro
    } catch (error) {
      // Se o ficheiro não existe ou não pode ser lido, retorna 404
      console.error(`Avatar não encontrado ou inacessível: ${avatarPath}`, error)
      return response.notFound('Avatar não encontrado')
    }
  }
}
