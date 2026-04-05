import { z } from 'zod'
import { CITIES } from '@/types'

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'الاسم مطلوب ويجب أن يكون حرفين على الأقل'),
    whatsapp: z
      .string()
      .min(9, 'رقم واتساب غير صحيح')
      .max(15, 'رقم واتساب غير صحيح')
      .regex(/^[0-9]+$/, 'يجب أن يحتوي الرقم على أرقام فقط'),
    password: z.string().min(6, 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })

export const LoginSchema = z.object({
  whatsapp: z
    .string()
    .min(9, 'رقم واتساب غير صحيح')
    .regex(/^[0-9]+$/, 'يجب أن يحتوي الرقم على أرقام فقط'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const ListingSchema = z.object({
  type: z.enum(['room_available', 'looking_for_roommate']),
  title: z
    .string()
    .max(100, 'العنوان طويل جداً (100 حرف كحد أقصى)')
    .optional(),
  description: z
    .string()
    .min(20, 'الوصف قصير جداً')
    .max(1000, 'الوصف طويل جداً (1000 حرف كحد أقصى)'),
  city: z.enum(CITIES as unknown as [string, ...string[]]),
  neighborhood: z.string().optional(),
  price: z
    .number({ message: 'السعر مطلوب' })
    .min(100, 'السعر يجب أن يكون 100 درهم على الأقل')
    .max(50000, 'السعر مرتفع جداً'),
  gender_preference: z.enum(['any', 'male', 'female']),
  tags: z.array(z.string()).optional(),
  whatsapp_number: z
    .string()
    .min(9, 'رقم واتساب غير صحيح')
    .regex(/^[0-9]+$/, 'يجب أن يحتوي الرقم على أرقام فقط'),
})

export type RegisterFormData = z.infer<typeof RegisterSchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type ListingFormData = z.infer<typeof ListingSchema>
