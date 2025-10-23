import vine from '@vinejs/vine'

export const createProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    price: vine.number().positive(),
    description: vine.string().minLength(3).trim(),
    image: vine.file({
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    }),
  })
)

export const updateProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    price: vine.number().positive().optional(),
    description: vine.string().minLength(3).trim().optional(),
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
  })
)
