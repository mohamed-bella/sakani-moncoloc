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
  const [menuOpen, setMenuOpen] = useState(false)
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
          .single()
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
          .single()
          .then(({ data }) => {
            setIsAdmin(data?.is_admin ?? false)
            setIsBanned(data?.is_banned ?? false)
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
    router.refresh()
  }

  const handlePostClick = () => {
    if (!user) {
      router.push('/auth/login?redirectTo=/post')
      return
    }
    setShowPostModal(true)
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      <div className="bg-white border-b border-[#ccc] fixed top-0 w-full z-50">
        <div className="max-w-[1280px] mx-auto px-4 w-full h-[48px] flex items-center justify-between">
          
          {/* Brand & Left Actions */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 no-underline text-[#1c1c1c] hover:opacity-80">
              <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-10 h-10 object-contain" />
              <span className="text-[1.2rem] font-bold tracking-tight">moncoloc.ma</span>
            </Link>
          </div>

          {/* Center Nav Links */}
          <div className="hidden md:flex flex-grow max-w-[500px] justify-center text-sm font-semibold text-[#787C7E] items-center">
            <Link href="/" className={`px-4 py-1.5 rounded-full ${isActive('/') ? 'bg-[#f0f0f0] text-[#1c1c1c]' : 'hover:bg-[#f6f7f8]'}`}>الرئيسية</Link>
            {user && (
              <>
                <div className="w-px h-6 bg-[#ccc] mx-2 self-center"></div>
                <Link href="/dashboard" className={`px-4 py-1.5 rounded-full ${isActive('/dashboard') ? 'bg-[#f0f0f0] text-[#1c1c1c]' : 'hover:bg-[#f6f7f8]'}`}>لوحة التحكم</Link>
              </>
            )}
            {isAdmin && (
              <>
                <div className="w-px h-6 bg-[#ccc] mx-2 self-center"></div>
                <Link
                  href="/admin"
                  className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 font-black ${
                    isActive('/admin') ? 'bg-[#FF4500] text-white' : 'text-[#FF4500] hover:bg-[#FF4500]/10'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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
                <div className={`flex items-center gap-2 cursor-pointer border p-1 pr-3 pl-1 rounded-md transition-colors ${
                  isBanned ? 'border-[#FF4500]/40 bg-[#FF4500]/5' : 'border-transparent hover:border-[#ccc]'
                }`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                    isBanned ? 'bg-[#FF4500]/10 border-[#FF4500]/40 text-[#FF4500]' : 'bg-[#F0F2F5] border-[#ccc] text-[#787C7E]'
                  }`}>
                    {isBanned ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[0.65rem] font-bold leading-none mb-1 ${
                      isBanned ? 'text-[#FF4500]' : 'text-[#1c1c1c]'
                    }`}>
                      {isBanned ? '⛔ موقوف' : user.email?.split('@')[0]}
                    </span>
                    <button onClick={handleLogout} className="text-[0.65rem] text-[#787C7E] hover:text-[#0079D3] leading-none text-right">خروج</button>
                  </div>
                </div>
                {!isBanned && (
                  <button 
                    onClick={handlePostClick}
                    className="btn-accent px-4 py-1.5 text-sm h-[32px]"
                  >
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    أضف إعلانك
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="btn-outline px-4 py-1.5 text-sm h-[32px]">دخول</Link>
                <button 
                  onClick={handlePostClick}
                  className="btn-accent px-4 py-1.5 text-sm h-[32px]"
                >
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  أضف إعلانك
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle & Actions */}
          <div className="flex md:hidden items-center gap-2">
            {(!user || !isBanned) && (
              <button 
                onClick={handlePostClick}
                className="btn-accent px-3 py-1 text-xs h-[32px] font-bold shadow-sm"
              >
                + إعلان جديد
              </button>
            )}
            <button 
              className="text-[#787C7E] p-1 rounded hover:bg-[#f6f7f8]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 {menuOpen ? (
                   <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                 ) : (
                   <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                 )}
              </svg>
            </button>
          </div>

          {/* Mobile Dropdown */}
          {menuOpen && (
            <div className="absolute top-[48px] left-0 right-0 bg-white border-b border-[#ccc] shadow-lg flex flex-col items-stretch p-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <Link href="/" className="py-3 text-sm font-bold border-b border-[#f0f0f0]" onClick={() => setMenuOpen(false)}>الرئيسية</Link>
                
                {user ? (
                   <>
                     <Link href="/dashboard" className="py-3 text-sm font-bold border-b border-[#f0f0f0]" onClick={() => setMenuOpen(false)}>لوحة التحكم</Link>
                     {isAdmin && (
                       <Link href="/admin" className="py-3 text-sm font-bold border-b border-[#f0f0f0] text-[#FF4500] flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                         🛡️ لوحة الإدارة
                       </Link>
                     )}
                     {!isBanned && (
                       <button 
                        onClick={() => { handlePostClick(); setMenuOpen(false); }}
                        className="py-3 text-sm font-bold border-b border-[#f0f0f0] text-[#FF4500] text-right"
                       >
                         + أضف إعلانك
                       </button>
                     )}
                     <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="py-3 text-sm font-bold text-right text-[#787C7E] cursor-pointer">تسجيل الخروج</button>
                   </>
                ) : (
                   <div className="pt-4 flex flex-col gap-3">
                     <button 
                        onClick={() => { handlePostClick(); setMenuOpen(false); }}
                        className="btn-accent w-full py-2"
                     >
                        + أضف إعلانك
                     </button>
                     <Link href="/auth/login" className="btn-outline w-full py-2" onClick={() => setMenuOpen(false)}>دخول</Link>
                   </div>
                )}
            </div>
          )}

          {/* Post Listing Modal (Sheet on mobile) */}
          {showPostModal && (
            <ResponsiveModal onClose={() => setShowPostModal(false)} title="أضف إعلانك الجديد">
              <PostListingForm onSuccess={handlePostSuccess} />
            </ResponsiveModal>
          )}
        </div>
      </div>
      <div className="h-[48px]" /> {/* Spacer for fixed navbar */}
    </>
  )
}
