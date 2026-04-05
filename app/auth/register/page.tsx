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

      // ─── STEP 2: Create the auth user (Trigger will handle profile via metadata) ──
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            whatsapp: normalizedWhatsApp,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('حدث خطأ أثناء إنشاء الحساب')

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-[450px]">
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-4 hover:scale-105 transition-transform">
            <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-16 h-16 object-contain" />
          </Link>
          <h1 className="text-2xl font-black text-[#1c1c1c] tracking-tight">إنشاء حساب جديد</h1>
          <p className="text-[#65676B] text-sm font-bold mt-1">انضم إلى أكبر شبكة للسكن المشترك في المغرب</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#edeff1] p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-[#fff0e5] border border-[#ff4500]/20 rounded-xl text-[#ff4500] text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-[#65676B] uppercase tracking-wider mr-1">الاسم الكامل</label>
              <input
                type="text"
                {...register('name')}
                placeholder="مثال: يوسف العلمي"
                className={`w-full px-4 py-3.5 bg-[#f6f7f8] border-2 border-transparent rounded-xl text-sm font-bold focus:outline-none focus:border-[#0079D3] focus:bg-white transition-all text-right ${errors.name ? 'border-red-500/50 bg-red-50/30' : ''}`}
                disabled={isSubmitting}
                dir="rtl"
              />
              {errors.name && <p className="text-[#ff4500] text-[10px] font-bold mr-1">{errors.name.message}</p>}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-[#65676B] uppercase tracking-wider mr-1">رقم الواتساب</label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('whatsapp')}
                  placeholder="0600000000"
                  className={`w-full px-4 py-3.5 bg-[#f6f7f8] border-2 border-transparent rounded-xl text-sm font-bold focus:outline-none focus:border-[#0079D3] focus:bg-white transition-all text-right ${errors.whatsapp ? 'border-red-500/50 bg-red-50/30' : ''}`}
                  disabled={isSubmitting}
                  dir="rtl"
                />
              </div>
              {errors.whatsapp && <p className="text-[#ff4500] text-[10px] font-bold mr-1">{errors.whatsapp.message}</p>}
            </div>

            {/* Passwords */}
            <div className="space-y-5 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#65676B] uppercase tracking-wider mr-1">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3.5 bg-[#f6f7f8] border-2 border-transparent rounded-xl text-sm font-bold focus:outline-none focus:border-[#0079D3] focus:bg-white transition-all text-right ${errors.password ? 'border-red-500/50 bg-red-50/30' : ''}`}
                    disabled={isSubmitting}
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-4 text-[#878A8C] hover:text-[#0079D3] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    ) : (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.053 0 2.062.18 3 .512M7.943 7.943A5.001 5.001 0 1016.057 16.057M16.057 16.057l4.243 4.243M9.878 9.878l4.242 4.242M21 21l-9-9"/></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-[#ff4500] text-[10px] font-bold mr-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#65676B] uppercase tracking-wider mr-1">تأكيد كلمة المرور</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3.5 bg-[#f6f7f8] border-2 border-transparent rounded-xl text-sm font-bold focus:outline-none focus:border-[#0079D3] focus:bg-white transition-all text-right ${errors.confirmPassword ? 'border-red-500/50 bg-red-50/30' : ''}`}
                  disabled={isSubmitting}
                  dir="rtl"
                />
                {errors.confirmPassword && <p className="text-[#ff4500] text-[10px] font-bold mr-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0079D3] hover:bg-[#0062ab] active:scale-[0.98] text-white py-4 rounded-2xl text-[1.05rem] font-black transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 mt-6"
            >
              {isSubmitting && <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{isSubmitting ? 'جاري التحميل...' : 'إنشاء الحساب الآن'}</span>
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-[#f0f2f5] text-center">
             <p className="text-[#65676B] text-sm font-bold">
               لديك حساب بالفعل؟{' '}
               <Link href="/auth/login" className="text-[#0079D3] hover:underline font-black mr-1">
                 تسجيل الدخول
               </Link>
             </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="mt-8 text-[11px] text-[#878A8C] text-center font-bold px-4 leading-relaxed">
          بإنشائك للحساب، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بسكني.
        </p>
      </div>
    </div>
  )
}
