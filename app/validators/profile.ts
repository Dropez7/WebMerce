import vine from '@vinejs/vine'

export const ProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).optional(),
    age: vine.number().positive().optional().nullable(),
    address: vine.string().trim().optional().nullable(),
    postalCode: vine
      .string()
      .regex(/^\d{5}-?\d{3}$/)
      .optional()
      .nullable(),
    nationality: vine.string().trim().optional().nullable(),
    gender: vine.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
    phone: vine.string().trim().optional().nullable(),
    avatar: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
      })
      .optional(),
  })
)
