// database/migrations/xxxx_add_avatar_to_users.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Coluna para guardar o nome do ficheiro da imagem de perfil
      table.string('avatar_filename').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('avatar_filename')
    })
  }
}
