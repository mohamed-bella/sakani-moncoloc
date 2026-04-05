import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side guard: fetch user + profile and redirect if not admin
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, is_banned, name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.is_banned || !profile.is_admin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Admin Top Bar */}
      <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#FF4500] rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-white font-black text-sm tracking-tight">لوحة التحكم الإدارية</span>
          <span className="text-[#8b949e] text-xs font-mono hidden sm:block">moncoloc.ma</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#58a6ff] text-xs font-bold bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
            🛡️ {profile.name}
          </span>
          <a href="/" className="text-[#8b949e] hover:text-white text-xs transition-colors">
            ← العودة للموقع
          </a>
        </div>
      </div>

      {children}
    </div>
  )
}
