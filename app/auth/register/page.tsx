'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { whatsappToEmail, normalizeWhatsApp } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const normalizedWhatsApp = normalizeWhatsApp(data.whatsapp)
      const email = whatsappToEmail(data.whatsapp)

      // ─── STEP 1: Pre-flight uniqueness check ───────────────────
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('whatsapp')
        .eq('whatsapp', normalizedWhatsApp)
        .maybeSingle()

      if (checkError) throw checkError
      if (existing) throw new Error('رقم الواتساب مسجل مسبقاً. يرجى تسجيل الدخول.')

      // ─── STEP 2: Create the auth user ─────────────────────────
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('حدث خطأ أثناء إنشاء الحساب')

      // ─── STEP 3: Insert profile ──────────────────────────────
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: data.name,
          whatsapp: normalizedWhatsApp,
        })

      if (profileError) {
        await supabase.auth.signOut()
        throw profileError
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
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">! أنشئ حسابك </h1>
        <div className="w-[120%] h-[150px] bg-white absolute -bottom-[70px] left-1/2 -translate-x-1/2 rounded-[100%]"></div>
      </div>

      <div className="max-w-[480px] mx-auto px-6 relative -mt-16 z-10 flex flex-col items-center pb-20">
        <div className="bg-white rounded-[40px] p-10 border-2 border-[#f0f0f0] w-full flex flex-col items-stretch">
          
          <div className="flex justify-center mb-10">
            <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-16 h-16 object-contain" />
          </div>

          {error && (
            <div className="w-full bg-red-50 text-red-500 p-4 rounded-2xl text-xs mb-6 text-center font-black border border-red-100 italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#000080] uppercase tracking-widest px-2">الاسم الكامل (مثال: أحمد محمد)</label>
              <div className="relative">
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-6 py-4 bg-[#f8f9fb] border-2 border-[#eeeeee] rounded-2xl text-sm font-bold focus:outline-none focus:border-[#000080] focus:bg-white transition-all text-right placeholder:text-gray-300"
                  placeholder="الاسم الكامل"
                  disabled={isSubmitting}
                  dir="rtl"
                />
              </div>
              {errors.name && <p className="text-red-500 text-[10px] font-black px-2">{errors.name.message}</p>}
            </div>

            {/* WhatsApp */}
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
              {errors.whatsapp && <p className="text-red-500 text-[10px] font-black px-2">{errors.whatsapp.message}</p>}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#000080] uppercase tracking-widest px-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full px-5 py-4 bg-[#f8f9fb] border-2 border-[#eeeeee] rounded-2xl text-xs font-bold focus:outline-none focus:border-[#000080] focus:bg-white transition-all text-right placeholder:text-gray-300 font-black"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-4 flex items-center text-gray-300 hover:text-[#000080]"
                    tabIndex={-1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.053 0 2.062.18 3 .512M7.943 7.943A5.001 5.001 0 1016.057 16.057M16.057 16.057l4.243 4.243M9.878 9.878l4.242 4.242M21 21l-9-9" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[10px] font-black px-2">{errors.password.message}</p>}
              </div>

              {/* Confirm */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-[#000080] uppercase tracking-widest px-2">تأكيد الكلمة</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className="w-full px-5 py-4 bg-[#f8f9fb] border-2 border-[#eeeeee] rounded-2xl text-xs font-bold focus:outline-none focus:border-[#000080] focus:bg-white transition-all text-right placeholder:text-gray-300 font-black"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    dir="rtl"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[10px] font-black px-2">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#000080] text-white py-5 rounded-2xl text-lg font-black transition-all hover:bg-blue-900 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              ! سجل الآن 
            </button>
          </form>

          <div className="mt-12 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
            لديك حساب بالفعل؟ <Link href="/auth/login" className="text-[#000080] border-b-2 border-blue-50 pb-1 ml-1 hover:border-blue-200 transition-all">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
