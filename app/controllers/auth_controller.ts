import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user' // Importe o modelo User
import { registerValidator } from '#validators/register' // Importe o validator

export default class AuthController {
  /**
   * Show form to create a new user account
   */
  async create({ view }: HttpContext) {
    return view.render('pages/auth/register') // Renderiza a view criada
  }

  /**
   * Handle user registration form submission
   */
  async store({ request, response, auth, session }: HttpContext) {
    // 1. Validar os dados do formulário
    const payload = await request.validateUsing(registerValidator)

    try {
      // 2. Criar o novo usuário no banco de dados
      // A senha será automaticamente hasheada pelo `AuthFinder` no Model User
      const user = await User.create(payload)

      // 3. Logar o usuário recém-criado
      await auth.use('web').login(user) // 'web' é o guard padrão definido em config/auth.ts

      // 4. Redirecionar para a página inicial (ou outra página desejada)
      session.flash({ success: 'Conta criada com sucesso!' }) // Mensagem opcional de sucesso
      return response.redirect().toRoute('/') // Redireciona para a home
    } catch (error) {
      // Em caso de erro (ex: falha ao salvar no banco), redireciona de volta
      // com mensagem de erro e dados antigos
      session.flash({ error: 'Erro ao criar a conta. Tente novamente.', ...request.all() })
      return response.redirect().back()
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('/')
  }
}
