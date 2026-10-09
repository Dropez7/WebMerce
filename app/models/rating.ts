import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import Product from '#models/product'
import User from '#models/user'

export default class Rating extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare userId: number

  @column()
  declare score: number

  @column()
  declare comment?: string

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
