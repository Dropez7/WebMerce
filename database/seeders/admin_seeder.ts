import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Deletar usuário admin existente se houver
    const existingAdmin = await User.findBy('email', 'admin@rocknroll.com')
    if (existingAdmin) {
      await existingAdmin.delete()
      console.log('🗑️ Usuário admin anterior removido')
    }
    
    // Criar hash da senha manualmente usando scrypt
    const hashedPassword = await hash.use('scrypt').make('12345678')
    console.log('🔐 Hash criado manualmente:', hashedPassword.substring(0, 50) + '...')
    
    // Testar o hash imediatamente
    const testHash = await hash.use('scrypt').verify(hashedPassword, '12345678')
    console.log('✅ Hash testado imediatamente:', testHash ? 'VÁLIDO' : 'INVÁLIDO')
    
    // Criar usuário diretamente no banco para evitar problemas com hooks
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    await db
      .table('users')
      .insert({
        full_name: 'Administrador Rock n Roll',
        email: 'admin@rocknroll.com',
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
    
    const admin = await User.findBy('email', 'admin@rocknroll.com')
    
    console.log('✅ Novo usuário administrador criado!')
    console.log('📧 Email: admin@rocknroll.com')
    console.log('🔑 Senha: 12345678')
    console.log('👑 Role:', admin.role)
    console.log('🆔 ID:', admin.id)
    console.log('🔐 Hash da senha:', admin.password.substring(0, 50) + '...')
    
    // Testar se a senha funciona - método 1: verifyCredentials
    try {
      const testUser = await User.verifyCredentials('admin@rocknroll.com', '12345678')
      console.log('✅ Teste verifyCredentials: SUCESSO!')
      console.log('📧 Usuário verificado:', testUser.email)
    } catch (error: any) {
      console.log('❌ Teste verifyCredentials: FALHOU!')
      console.log('❌ Erro:', error.message)
    }
    
    // Testar se a senha funciona - método 2: verificação manual com scrypt
    const savedAdmin = await User.findBy('email', 'admin@rocknroll.com')
    if (savedAdmin) {
      const isValid = await hash.use('scrypt').verify(savedAdmin.password, '12345678')
      console.log('🔐 Teste manual do hash (scrypt):', isValid ? '✅ SUCESSO!' : '❌ FALHOU!')
      
      // Também testar com hash padrão
      const isValidDefault = await hash.verify(savedAdmin.password, '12345678')
      console.log('🔐 Teste manual do hash (default):', isValidDefault ? '✅ SUCESSO!' : '❌ FALHOU!')
    }
  }
}