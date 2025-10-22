// app/controllers/profile_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import vine from '@vinejs/vine'

// Validator para atualização do perfil
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
  })
)

export default class ProfileController {
  /**
   * Show form to edit the user's profile.
   */
  async edit({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return view.render('pages/profile/edit', { user })
  }

  /**
   * Update user's profile.
   */
  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)

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
      session.flash({ error: 'Erro ao atualizar o perfil. Tente novamente.' })
      return response.redirect().back()
    }
  }
}
