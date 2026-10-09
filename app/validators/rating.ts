import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const ratingValidator = schema.create({
  score: schema.number([rules.required(), rules.range(1, 5)]),
  comment: schema.string.optional()
})
