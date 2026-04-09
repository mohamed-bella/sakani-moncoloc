'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import ResponsiveModal from './ResponsiveModal'
import PostListingForm from './PostListingForm'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isBanned, setIsBanned] = useState(false)
  const [loading, setLoading] = useState(true)

  const [showPostModal, setShowPostModal] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      if (authUser) {
        // Update user activity (debounced to once per hour to prevent DB spam)
        const lastSync = localStorage.getItem('last_activity_sync')
        const now = Date.now()
        if (!lastSync || now - parseInt(lastSync) > 1000 * 60 * 60) {
           supabase.rpc('touch_user_activity').then()
           localStorage.setItem('last_activity_sync', now.toString())
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, is_banned')
          .eq('id', authUser.id)
          .maybeSingle() // Consistency fix: avoid 406
        setIsAdmin(profile?.is_admin ?? false)
        setIsBanned(profile?.is_banned ?? false)
      }
      setLoading(false)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null)
        setIsAdmin(false)
        setIsBanned(false)
      } else {
        setUser(session.user)
        // re-fetch profile on auth change
        supabase
          .from('profiles')
          .select('is_admin, is_banned')
          .eq('id', session.user.id)
          .maybeSingle() // Use maybeSingle to avoid 406 error if row is missing
          .then(({ data }) => {
            if (data) {
              setIsAdmin(data.is_admin ?? false)
              setIsBanned(data.is_banned ?? false)
            } else {
              // Row missing: either not created yet or logic error.
              // We'll safely fallback to guest permissions.
              setIsAdmin(false)
              setIsBanned(false)
            }
          })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handlePostSuccess = () => {
    setShowPostModal(false)
    // Trigger homepage feed to re-fetch without full reload
    window.dispatchEvent(new Event('listings:refresh'))
  }

  const handlePostClick = () => {
    setShowPostModal(true)
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      <div className="bg-white border-b border-[#edeff1] fixed top-0 w-full z-50">
        <div className="max-w-[1280px] mx-auto px-4 w-full h-[48px] flex items-center justify-between relative">
          
          {/* ─── DESKTOP: Brand left ─── */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 no-underline text-[#1A1A1B] hover:opacity-80">
              <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center shadow-sm">
                <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <span className="text-[1.1rem] font-bold tracking-tight">moncoloc.ma</span>
            </Link>
          </div>

          {/* ─── MOBILE: Centered logo (absolute center trick) ─── */}
          <div className="md:hidden absolute left-0 right-0 flex justify-center pointer-events-none">
            <Link href="/" className="flex items-center gap-2 no-underline text-[#1A1A1B] pointer-events-auto">
              <div className="w-7 h-7 bg-[#FF4500] rounded-full flex items-center justify-center p-1">
                <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <span className="text-[1rem] font-bold tracking-tight">moncoloc.ma</span>
            </Link>
          </div>

          {/* Center Nav Links */}
          <div className="hidden md:flex flex-grow max-w-[500px] justify-center text-sm font-bold text-[#1A1A1B] items-center">
            <Link href="/" className={`px-4 py-1.5 rounded-full transition-colors ${isActive('/') ? 'bg-[#f6f7f8] text-[#0079D3]' : 'hover:bg-[#f6f7f8]'}`}>الرئيسية</Link>
            
            {user && (
              <>
                <div className="w-px h-5 bg-[#edeff1] mx-2"></div>
                <Link href="/saved" className={`px-4 py-1.5 rounded-full transition-colors ${isActive('/saved') ? 'bg-[#f6f7f8] text-[#0079D3]' : 'hover:bg-[#f6f7f8]'}`}>المفضلة</Link>
                
                <div className="w-px h-5 bg-[#edeff1] mx-2"></div>
                <Link href="/dashboard" className={`px-4 py-1.5 rounded-full transition-colors ${isActive('/dashboard') ? 'bg-[#f6f7f8] text-[#0079D3]' : 'hover:bg-[#f6f7f8]'}`}>إعلاناتي</Link>
              </>
            )}

            {isAdmin && (
              <>
                <div className="w-px h-5 bg-[#edeff1] mx-2"></div>
                <Link
                  href="/admin"
                  className={`px-4 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                    isActive('/admin') ? 'bg-[#FF4500] text-white shadow-sm' : 'text-[#FF4500] hover:bg-[#FF4500]/10'
                  }`}
                >
                  إدارة
                </Link>
              </>
            )}
          </div>

          {/* Right Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-8 skeleton rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer border border-transparent hover:border-[#edeff1] px-2 py-1 rounded transition-colors group">
                  <div className="w-7 h-7 rounded bg-[#F6F7F8] border border-[#edeff1] flex items-center justify-center text-[#787C7E] group-hover:bg-[#e8ecef]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.7rem] font-bold text-[#1A1A1B] leading-none mb-0.5">{user.email?.split('@')[0]}</span>
                    <button onClick={handleLogout} className="text-[0.65rem] text-[#7C7C7C] hover:text-[#0079D3] leading-none text-right">خروج</button>
                  </div>
                </div>
                {!isBanned && (
                  <button 
                    onClick={handlePostClick}
                    className="btn-primary h-[32px] px-4"
                  >
                    أنشئ منشوراً
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePostClick}
                  className="btn-primary h-[32px] px-6 text-sm"
                >
                  أنشئ منشوراً
                </button>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════
               MOBILE BOTTOM NAV — Reddit style
          ═══════════════════════════════════════════════ */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] h-[64px] pb-safe"
               style={{ background: 'rgba(255,255,255,0.98)', borderTop: '1px solid #edeff1' }}>

            <div className="h-full flex items-center">

              <div className="flex-1 flex justify-around items-center h-full">
                
                {/* Home */}
                <Link href="/" className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${
                  isActive('/') ? 'text-[#1A1A1B]' : 'text-[#878A8C]'
                }`}>
                  <svg className="w-[22px] h-[22px]" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/') ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-[10px] font-bold">الرئيسية</span>
                </Link>

                {/* Create FAB */}
                <button
                  onClick={handlePostClick}
                  className="w-[44px] h-[44px] bg-[#F6F7F8] border border-[#edeff1] rounded-full flex items-center justify-center text-[#1A1A1B] active:scale-90 transition-all shadow-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {/* Conditional Private Links */}
                {user ? (
                   <Link href="/dashboard" className={`flex flex-col items-center justify-center gap-1 transition-all active:scale-90 ${
                    isActive('/dashboard') ? 'text-[#0079D3]' : 'text-[#878A8C]'
                  }`}>
                    <svg className="w-[22px] h-[22px]" fill={isActive('/dashboard') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/dashboard') ? 0 : 2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-[10px] font-bold">إعلاناتي</span>
                  </Link>
                ) : (
                  <div className="w-[44px]" /> // Spacer
                )}

                {/* Profile / Logout or nothing */}
                {user && (
                   <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 text-[#878A8C] active:scale-90 transition-all">
                    <div className="w-6 h-6 rounded bg-[#edeff1] flex items-center justify-center text-[#1A1A1B] text-[10px] font-bold border border-[#ccc]">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-bold">خروج</span>
                  </button>
                )}
              </div>

            </div>
          </nav>

          {/* Post Listing Modal (Sheet on mobile) */}
          {showPostModal && (
            <ResponsiveModal onClose={() => setShowPostModal(false)}>
              <PostListingForm onSuccess={handlePostSuccess} inModal />
            </ResponsiveModal>
          )}
        </div>
      </div>
      <div className="h-[48px]" /> {/* Spacer for fixed navbar */}
    </>
  )
}
