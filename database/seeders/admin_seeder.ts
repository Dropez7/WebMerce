import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'

export default class extends BaseSeeder {
  async run() {
    const adminEmail = env.get('ADMIN_EMAIL')
    const adminPassword = env.get('ADMIN_PASSWORD')

    if (!adminEmail || !adminPassword) {
      return
    }

    const existingAdmin = await User.findBy('email', adminEmail)
    if (existingAdmin) {
      await existingAdmin.delete()
    }
    
    const hashedPassword = await hash.use('scrypt').make(adminPassword)
    
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    await db
      .table('users')
      .insert({
        full_name: 'Administrador Rock n Roll',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        age: 30,
        address: 'Backstage VIP',
        postal_code: '00000-000',
        nationality: 'Rock',
        gender: 'other',
        phone: '(00) 00000-0000',
        created_at: now,
        updated_at: now
      })
  }
}