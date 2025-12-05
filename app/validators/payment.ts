import vine from '@vinejs/vine'

const currentYear = new Date().getFullYear()

export const paymentValidator = vine.compile(
  vine.object({
    holderName: vine.string().trim().optional(),
    fullName: vine.string().trim().minLength(2),
    cardNumber: vine.string().trim().minLength(13).maxLength(19),
    expiryMonth: vine.number().min(1).max(12),
    expiryYear: vine.number().min(currentYear),
    cvv: vine.string().trim().minLength(3).maxLength(4),
    quantity: vine.number().min(1).optional(),
    // Shipping / billing fields
    cep: vine.string().trim().minLength(8).maxLength(9),
    street: vine.string().trim().minLength(2),
    houseNumber: vine.string().trim().minLength(1),
    complement: vine.string().trim().optional(),
    reference: vine.string().trim().optional(),
    cpf: vine.string().trim().minLength(11).maxLength(14),
  })
)

export type PaymentSchema = typeof paymentValidator
