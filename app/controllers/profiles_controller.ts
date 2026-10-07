import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { promises as fs } from 'node:fs'
import router from '@adonisjs/core/services/router'
import { ProfileValidator } from '#validators/profile'

const AVATARS_PATH = app.makePath('tmp/avatars')

export default class ProfileController {
  async edit({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const avatarUrl = user.avatarFilename
      ? router.makeUrl('avatars.show', { filename: user.avatarFilename })
      : null
    return view.render('pages/profile/edit', { user, avatarUrl })
  }

  async update({ request, response, session, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(ProfileValidator)

    if (payload.avatar) {
      const newFilename = `${cuid()}.${payload.avatar.extname}`

      // 1. Garante que o diretório exista no container da Vercel
      await fs.mkdir(AVATARS_PATH, { recursive: true })

      await payload.avatar.move(AVATARS_PATH, {
        name: newFilename,
        overwrite: true,
      })

      // 2. Apaga o avatar antigo se existir, ignorando erros ENOENT
      if (payload.avatar.state === 'moved' && user.avatarFilename) {
        const oldFilePath = app.makePath(AVATARS_PATH, user.avatarFilename)
        try {
          await fs.unlink(oldFilePath)
        } catch {
          // Ignora se o arquivo antigo não existir no disco
        }
      }

      if (payload.avatar.state === 'moved') {
        user.avatarFilename = newFilename
      }
    }

    user.merge({
      fullName: payload.fullName,
      age: payload.age,
      address: payload.address,
      postalCode: payload.postalCode,
      nationality: payload.nationality,
      gender: payload.gender,
      phone: payload.phone,
    })

    await user.save()

    session.flash({ success: 'Perfil atualizado com sucesso!' })
    return response.redirect().back()
  }
}