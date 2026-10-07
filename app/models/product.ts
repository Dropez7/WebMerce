import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import Image from '#models/image'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  // Converte NUMERIC (string) retornado pelo PostgreSQL para number no JS
  @column({
    consume: (value: any) => (value !== null && value !== undefined ? Number(value) : 0),
  })
  declare price: number

  @column()
  declare description: string

  @column()
  declare quantity: number

  @hasMany(() => Image)
  declare images: HasMany<typeof Image>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}