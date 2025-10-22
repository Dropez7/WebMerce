// app/controllers/profile_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs/promises'
import router from '@adonisjs/core/services/router' // <<<--- Importação adicionada

// Validator para atualização do perfil (incluindo avatar opcional)
const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).optional(),
    age: vine.number().positive().optional().nullable(),
    address: vine.string().trim().optional().nullable(),
    postalCode: vine
      .string()
      .regex(/^\d{5}-?\d{3}$/)
      .optional()
      .nullable(),
    nationality: vine.string().trim().optional().nullable(),
    gender: vine.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
    phone: vine.string().trim().optional().nullable(),
    avatar: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
  })
)

const AVATARS_PATH = app.makePath('tmp/avatars')

export default class ProfileController {
  /**
   * Show form to edit the user's profile.
   */
  async edit({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const avatarUrl = user.avatarFilename
      ? router.makeUrl('avatars.show', { filename: user.avatarFilename }) // Agora 'router' está definido
      : null
    return view.render('pages/profile/edit', { user, avatarUrl })
  }

  /**
   * Update user's profile.
   */
  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)

    if (payload.avatar) {
      const newFilename = `${cuid()}.${payload.avatar.extname}`
      await payload.avatar.move(AVATARS_PATH, {
        name: newFilename,
        overwrite: true,
      })

      if (payload.avatar.state === 'moved' && user.avatarFilename) {
        try {
          const oldFilePath = app.makePath(AVATARS_PATH, user.avatarFilename)
          await fs.unlink(oldFilePath)
        } catch (error) {
          console.error('Erro ao apagar avatar antigo:', error)
        }
      }

      if (payload.avatar.state === 'moved') {
        user.avatarFilename = newFilename
      } else {
        session.flash({
          error: `Erro ao fazer upload do avatar: ${payload.avatar.errors[0]?.message || 'Erro desconhecido'}`,
        })
        return response.redirect().back()
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

    try {
      await user.save()
      session.flash({ success: 'Perfil atualizado com sucesso!' })
      return response.redirect().back()
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      session.flash({
        error: `Erro ao atualizar o perfil. Tente novamente. Detalhe: ${error.message}`,
      })
      return response.redirect().back()
    }
  }
}
