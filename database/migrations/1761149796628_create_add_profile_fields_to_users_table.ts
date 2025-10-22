// database/migrations/xxxx_add_profile_fields_to_users.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('age').nullable()
      table.string('address').nullable()
      table.string('postal_code', 10).nullable() // CEP
      table.string('nationality').nullable()
      table.enum('gender', ['male', 'female', 'other', 'prefer_not_to_say']).nullable()
      table.string('phone', 20).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('age')
      table.dropColumn('address')
      table.dropColumn('postal_code')
      table.dropColumn('nationality')
      table.dropColumn('gender')
      table.dropColumn('phone')
    })
  }
}
