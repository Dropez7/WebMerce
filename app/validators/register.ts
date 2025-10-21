import vine from '@vinejs/vine'

/**
 * Validates the user registration request
 */
export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        // Verifica se o email já existe na tabela 'users'
        const user = await db.from('users').where('email', value).first()
        return !user // Retorna true se o email NÃO existe (é único)
      }),
    password: vine.string().minLength(8).confirmed({
      confirmationField: 'password_confirmation', // Nome do campo de confirmação
    }),
  })
)
