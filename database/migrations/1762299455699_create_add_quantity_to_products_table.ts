import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('quantity').defaultTo(0).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quantity')
    })
  }
}
