'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema, type LoginFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { whatsappToEmail } from '@/lib/utils'

export default function AdministrativeLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Clear any existing session to ensure we are logging in as admin
  useEffect(() => {
    supabase.auth.signOut()
  }, [supabase])

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

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      })

      if (authError) {
        throw new Error('بيانات الدخول غير صحيحة')
      }

      // Check if the user is actually an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single()

      if (!profile?.is_admin) {
        await supabase.auth.signOut()
        throw new Error('هذا الحساب ليس لديه صلاحيات إدارية')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[400px]">
        
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-[#FF4500] rounded-full flex items-center justify-center shadow-2xl mb-6">
             <img src="/logo_moncoloc.ma.png" alt="sakani" className="w-10 h-10 object-contain brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Control Center</h1>
          <p className="text-[#8b949e] text-xs font-bold mt-2 uppercase tracking-widest opacity-60">Administrative Personnel Only</p>
        </div>

        <div className="bg-[#161b22] rounded-2xl border border-[#30363d] p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold text-center">
               {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest ml-1">ADMIN WHATSAPP</label>
              <input
                type="tel"
                {...register('whatsapp')}
                placeholder="06..."
                className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#58a6ff] transition-all"
                disabled={isSubmitting}
              />
              {errors.whatsapp && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.whatsapp.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest ml-1">ADMIN PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-sm font-bold text-white focus:outline-none focus:border-[#58a6ff] transition-all"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 text-[#8b949e] hover:text-[#58a6ff]"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.053 0 2.062.18 3 .512M7.943 7.943A5.001 5.001 0 1016.057 16.057M16.057 16.057l4.243 4.243M9.878 9.878l4.242 4.242M21 21l-9-9"/></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3.5 rounded-xl text-sm font-black transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{isSubmitting ? 'Accessing...' : 'Authorize Login'}</span>
            </button>
          </form>
        </div>

        <p className="mt-8 text-[9px] text-[#8b949e] text-center font-bold font-mono tracking-tighter opacity-50">
          SECURE TERMINAL // MONCOLOC.MA // SYSTEM V4.2
        </p>
      </div>
    </div>
  )
}
