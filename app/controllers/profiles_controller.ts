import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import router from '@adonisjs/core/services/router'
import { ProfileValidator } from '#validators/profile'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export default class ProfileController {
  async edit({ view, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const avatarUrl = user.avatarFilename
      ? user.avatarFilename.startsWith('http')
        ? user.avatarFilename
        : router.makeUrl('avatars.show', { filename: user.avatarFilename })
      : null

    return view.render('pages/profile/edit', { user, avatarUrl })
  }

  async update({ request, response, session, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(ProfileValidator)

    if (payload.avatar) {
      const newFilename = `${cuid()}.${payload.avatar.extname}`

      // Move para a pasta /tmp local do container serverless
      const tmpPath = path.join('/tmp', newFilename)
      await payload.avatar.move('/tmp', {
        name: newFilename,
        overwrite: true,
      })

      // Lê o buffer do arquivo
      const buffer = await fs.readFile(tmpPath)

      // Faz o upload direto para o Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(newFilename, buffer, {
          contentType: payload.avatar.headers['content-type'] || 'image/jpeg',
          upsert: true,
        })

      if (uploadErr) {
        session.flash({
          error: `Falha ao enviar avatar para Supabase: ${uploadErr.message}`,
        })
        return response.redirect().back()
      }

      // Obtém a URL pública gerada pelo Supabase
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(newFilename)

      // Limpa a foto antiga do bucket (se existir)
      if (user.avatarFilename && !user.avatarFilename.startsWith('http')) {
        await supabase.storage.from('avatars').remove([user.avatarFilename]).catch(() => {})
      }

      // Salva a URL pública inteira no banco
      user.avatarFilename = publicData.publicUrl

      // Remove o arquivo temporário da pasta /tmp
      await fs.unlink(tmpPath).catch(() => {})
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