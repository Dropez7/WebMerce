import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    
    const user = new User()
    user.fullName = payload.fullName
    user.email = payload.email
    user.password = payload.password
    user.role = 'user'
    
    await user.save()
    
    await auth.use('web').login(user)
    session.flash({ success: 'Conta criada com sucesso!' })
    return response.redirect().toRoute('products.index')
  }

  async showLogin({ view, auth, response }: HttpContext) {
    if (auth.user) {
      return response.redirect().toRoute('products.index')
    }
    
    return view.render('pages/auth/login')
  }

  async storeLogin({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    
    let user
    try {
      user = await User.verifyCredentials(email, password)
    } catch (verifyError: any) {
      const foundUser = await User.findBy('email', email)
      if (!foundUser) {
        session.flash({ error: 'Email ou senha inválidos.', email })
        return response.redirect().back()
      }
      
      const isValid = await hash.use('scrypt').verify(foundUser.password, password)
      
      if (!isValid) {
        session.flash({ error: 'Email ou senha inválidos.', email })
        return response.redirect().back()
      }
      
      user = foundUser
    }
    
    await auth.use('web').login(user)
    session.flash({ success: 'Login realizado com sucesso!' })
    return response.redirect().toRoute('products.index')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }
}
