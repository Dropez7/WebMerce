// app/models/user.ts
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

// Defina o tipo para o género para melhor type safety
type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

// Defina o tipo para roles de usuário
type UserRole = 'admin' | 'user'

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare age: number | null

  @column()
  declare address: string | null

  @column()
  declare postalCode: string | null

  @column()
  declare nationality: string | null

  @column()
  declare gender: Gender | null

  @column()
  declare phone: string | null

  @column()
  declare avatarFilename: string | null

  @column()
  declare role: UserRole

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /**
   * Hash password before saving
   */
  @beforeSave()
  static async hashPassword(user: any) {
    if (user.$dirty.password) {
      if (user.password && user.password.startsWith('$scrypt$')) {
        return
      }

      // Caso contrário, gera o hash
      user.password = await hash.use('scrypt').make(user.password)
    }
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.role === 'admin'
  }

  /**
   * Check if user is regular user
   */
  isUser(): boolean {
    return this.role === 'user'
  }
}
