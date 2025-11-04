// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Show form to create a new user account
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  /**
   * Handle user registration form submission
   */
  async store({ request, response, auth, session }: HttpContext) {
    console.log('Dados brutos da requisição:', request.all()) // Debug log
    
    try {
      const payload = await request.validateUsing(registerValidator)
      console.log('Payload validado:', payload) // Debug log
      
      // Define role padrão como 'user' para novos usuários
      const userData = { ...payload, role: 'user' as const }
      
      const user = await User.create(userData)
      console.log('Usuário criado:', user.toJSON()) // Debug log
      
      await auth.use('web').login(user)
      session.flash({ success: 'Conta criada com sucesso!' })
      return response.redirect().toRoute('products.index')
    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error.message) // Debug log
      console.error('❌ Stack:', error.stack) // Debug log
      
      // Se for erro de validação, mostrar mensagens específicas
      if (error.messages) {
        console.error('❌ Erros de validação:', error.messages)
        
        // Extrair mensagens de erro específicas
        const errorMessages = error.messages.map((msg: any) => {
          if (msg.rule === 'database.unique' && msg.field === 'email') {
            return 'Este email já está cadastrado. Use outro email ou faça login.'
          }
          if (msg.rule === 'confirmed' && msg.field === 'password') {
            return 'As senhas não coincidem. Verifique e tente novamente.'
          }
          if (msg.rule === 'minLength' && msg.field === 'password') {
            return 'A senha deve ter no mínimo 8 caracteres.'
          }
          if (msg.rule === 'minLength' && msg.field === 'fullName') {
            return 'O nome deve ter no mínimo 3 caracteres.'
          }
          if (msg.rule === 'email' && msg.field === 'email') {
            return 'Email inválido. Verifique o formato do email.'
          }
          return msg.message || 'Erro de validação.'
        })
        
        // Usar a primeira mensagem de erro ou uma genérica
        const errorMessage = errorMessages[0] || 'Erro de validação. Verifique os campos.'
        
        session.flash({ error: errorMessage, ...request.all() })
      } else {
        session.flash({ error: 'Erro ao criar a conta. Tente novamente.', ...request.all() })
      }
      
      return response.redirect().back()
    }
  }

  /**
   * Show login page
   */
  async showLogin({ view, auth, response }: HttpContext) {
    // Se já estiver logado, redirecionar para produtos
    if (auth.user) {
      return response.redirect().toRoute('products.index')
    }
    
    return view.render('pages/auth/login')
  }

  /**
   * Handle login form submission
   */
  async storeLogin({ request, response, auth, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      
      console.log('🔍 Tentativa de login:')
      console.log('📧 Email:', email)
      console.log('🔑 Senha recebida:', password ? 'Sim' : 'Não')

      // Tentar primeiro com verifyCredentials
      let user
      try {
        user = await User.verifyCredentials(email, password)
        console.log('✅ verifyCredentials: SUCESSO')
      } catch (verifyError: any) {
        console.log('⚠️ verifyCredentials falhou, tentando verificação manual...')
        
        // Fallback: verificação manual usando o mesmo driver scrypt
        const foundUser = await User.findBy('email', email)
        if (!foundUser) {
          throw new Error('Usuário não encontrado')
        }
        
        // Usar scrypt explicitamente para garantir compatibilidade
        const isValid = await hash.use('scrypt').verify(foundUser.password, password)
        
        if (!isValid) {
          console.log('🔍 Hash da senha no banco:', foundUser.password.substring(0, 50) + '...')
          console.log('🔍 Tentando verificar senha:', password)
          throw new Error('Senha inválida')
        }
        
        user = foundUser
        console.log('✅ Verificação manual: SUCESSO')
      }
      
      console.log('✅ Usuário encontrado:', user.email, 'Role:', user.role)
      
      await auth.use('web').login(user)
      session.flash({ success: 'Login realizado com sucesso!' })
      return response.redirect().toRoute('products.index')
    } catch (error: any) {
      console.log('❌ Erro no login:', error.message)
      console.log('❌ Stack:', error.stack)
      session.flash({ error: 'Email ou senha inválidos.', email: request.input('email') })
      return response.redirect().back()
    }
  }

  /**
   * Handle user logout
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }
}
