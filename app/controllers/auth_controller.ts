// app/controllers/auth_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'

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
      
      const user = await User.create(payload)
      console.log('Usuário criado:', user.toJSON()) // Debug log
      
      await auth.use('web').login(user)
      session.flash({ success: 'Conta criada com sucesso!' })
      return response.redirect().toRoute('products.index')
    } catch (error) {
      console.error('Erro ao criar usuário:', error) // Debug log
      session.flash({ error: 'Erro ao criar a conta. Tente novamente.', ...request.all() })
      return response.redirect().back()
    }
  }

  /**
   * Show login page
   */
  async showLogin({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  /**
   * Handle login form submission
   */
  async storeLogin({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      session.flash({ success: 'Login realizado com sucesso!' })
      return response.redirect().toRoute('products.index')
    } catch (error) {
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
