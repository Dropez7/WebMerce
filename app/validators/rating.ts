import vine from '@vinejs/vine'

export const ratingValidator = vine.compile(
  vine.object({
    score: vine.number().min(1).max(5),
    comment: vine.string().optional(),
  })
)