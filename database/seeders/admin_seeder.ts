import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run () {
    const adminEmail = 'admin@headbangers.com'
    const adminFullName = 'Admin Headbanger'
    const adminPasswordPlain = 'admin123'

    // Busca usuário admin existente
    const existing = await User.findBy('email', adminEmail)
    if (existing) {
      // Se já existir, garante que a role é admin e atualiza senha (opcional)
      existing.role = 'admin'
      existing.fullName = adminFullName
      // Atualiza senha somente se quiser mudar; aqui deixamos como está
      await existing.save()
      return
    }

    const hashed = await hash.use('scrypt').make(adminPasswordPlain)
    await User.create({
      fullName: adminFullName,
      email: adminEmail,
      password: hashed,
      role: 'admin',
    })
  }
}
