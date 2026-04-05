'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { whatsappToEmail } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const email = whatsappToEmail(data.whatsapp)

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      })

      if (authError) {
        throw new Error('رقم الواتساب أو كلمة المرور غير صحيحة')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Curved Header Section - Navy Blue Theme */}
      <div className="bg-[#000080] h-[260px] w-full relative overflow-hidden flex flex-col items-center justify-center pt-8">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">! مرحباً بعودتك</h1>
        <div className="w-[120%] h-[150px] bg-white absolute -bottom-[70px] left-1/2 -translate-x-1/2 rounded-[100%]"></div>
      </div>

      <div className="max-w-[420px] mx-auto px-6 relative -mt-16 z-10">
        <div className="bg-white rounded-[40px] p-10 border-2 border-[#f0f0f0] flex flex-col items-stretch">
          
          <div className="flex justify-center mb-8">
            <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-16 h-16 object-contain" />
          </div>

          {error && (
            <div className="w-full bg-red-50 text-red-500 p-4 rounded-2xl text-xs mb-6 text-center font-black border border-red-100 italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            
            {/* WhatsApp Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#000080] uppercase tracking-widest px-2">رقم الواتساب (مثال: 0600000000)</label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('whatsapp')}
                  className="w-full px-6 py-4 bg-[#f8f9fb] border-2 border-[#eeeeee] rounded-2xl text-sm font-bold focus:outline-none focus:border-[#000080] focus:bg-white transition-all text-right placeholder:text-gray-300"
                  placeholder="0600000000"
                  disabled={isSubmitting}
                  dir="rtl"
                />
              </div>
              {errors.whatsapp && <p className="text-red-500 text-[10px] font-black uppercase px-2">{errors.whatsapp.message}</p>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#000080] uppercase tracking-widest px-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="w-full px-6 py-4 bg-[#f8f9fb] border-2 border-[#eeeeee] rounded-2xl text-sm font-bold focus:outline-none focus:border-[#000080] focus:bg-white transition-all text-right placeholder:text-gray-300"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-6 flex items-center text-gray-300 hover:text-[#000080] transition-colors"
                  tabIndex={-1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.053 0 2.062.18 3 .512M7.943 7.943A5.001 5.001 0 1016.057 16.057M16.057 16.057l4.243 4.243M9.878 9.878l4.242 4.242M21 21l-9-9" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-black uppercase px-2">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#000080] text-white py-5 rounded-2xl text-lg font-black transition-all hover:bg-blue-900 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              دخول
            </button>
          </form>

          <div className="mt-12 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
            ليس لديك حساب؟ <Link href="/auth/register" className="text-[#000080] border-b-2 border-blue-50 pb-1 ml-1 hover:border-blue-200 transition-all">سجل الآن</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
