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
    router.refresh()
  }

  const handlePostClick = () => {
    if (!user) {
      router.push('/auth/register?redirectTo=/post')
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
                <Link href="/saved" className={`px-4 py-1.5 rounded-full ${isActive('/saved') ? 'bg-[#f0f0f0] text-[#1c1c1c]' : 'hover:bg-[#f6f7f8]'}`}>المفضلة</Link>
                <div className="w-px h-6 bg-[#ccc] mx-2 self-center"></div>
                <Link href="/dashboard" className={`px-4 py-1.5 rounded-full ${isActive('/dashboard') ? 'bg-[#f0f0f0] text-[#1c1c1c]' : 'hover:bg-[#f6f7f8]'}`}>إعلاناتي</Link>
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
                    <div className="flex items-center gap-1.5 leading-none mb-1">
                      <span className={`text-[0.65rem] font-bold ${
                        isBanned ? 'text-[#FF4500]' : 'text-[#1c1c1c]'
                      }`}>
                        {isBanned ? '⛔ موقوف' : user.email?.split('@')[0]}
                      </span>
                      {isAdmin && (
                        <span className="flex items-center gap-0.5 bg-[#FF4500]/10 text-[#FF4500] px-1 py-0.5 rounded text-[8px] font-black border border-[#FF4500]/20 uppercase">
                          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>
                          ADMIN
                        </span>
                      )}
                    </div>
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
                <Link href="/auth/login" className="px-3 py-1.5 text-sm font-bold text-[#787C7E] hover:text-[#0079D3] transition-colors">دخول</Link>
                <Link href="/auth/register" className="btn-accent px-4 py-1.5 text-sm h-[32px] flex items-center justify-center">سجل الآن</Link>
                <div className="w-px h-6 bg-[#ccc] mx-1"></div>
                <button 
                  onClick={handlePostClick}
                  className="bg-[#f0f2f5] hover:bg-[#e4e6eb] text-[#1c1c1c] px-4 py-1.5 text-sm h-[32px] rounded-full font-bold transition-all"
                >
                  أضف إعلانك
                </button>
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation (Instagram Style) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#edeff1] h-[64px] z-[100] flex items-center justify-between px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
            
            {/* Home */}
            <Link href="/" className={`flex flex-1 flex-col items-center justify-center h-full transition-all active:scale-90 ${isActive('/') ? 'text-[#0079D3]' : 'text-[#878A8C]'}`}>
              <svg className="w-6 h-6 mb-1" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/') ? "0" : "2.5"} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[9px] font-black uppercase tracking-tighter">الرئيسية</span>
            </Link>

            {/* Saved */}
            <Link href="/saved" className={`flex flex-1 flex-col items-center justify-center h-full transition-all active:scale-90 ${isActive('/saved') ? 'text-[#FF4500]' : 'text-[#878A8C]'}`}>
               <svg className="w-6 h-6 mb-1" fill={isActive('/saved') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/saved') ? "0" : "2.5"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
               <span className="text-[9px] font-black uppercase tracking-tighter">المفضلة</span>
            </Link>
            
            {/* ADD (Floating Center) */}
            <div className="flex-1 flex flex-col items-center justify-center h-full relative">
              <button 
                onClick={handlePostClick} 
                className="absolute -top-7 bg-[#FF4500] hover:bg-[#ff5414] active:scale-90 transition-all text-white rounded-full p-4 shadow-[0_8px_25px_rgba(255,69,0,0.4)] border-4 border-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
              </button>
              <span className="text-[9px] font-black text-[#878A8C] mt-8 uppercase tracking-tighter">أضف إعلان</span>
            </div>

            {/* Dashboard / Admin Panel */}
            {isAdmin ? (
              <Link href="/admin" className={`flex flex-1 flex-col items-center justify-center h-full transition-all active:scale-90 ${isActive('/admin') ? 'text-[#FF4500]' : 'text-[#878A8C]'}`}>
                 <svg className="w-6 h-6 mb-1" fill={isActive('/admin') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/admin') ? "0" : "2.5"} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                 </svg>
                 <span className="text-[9px] font-black uppercase tracking-tighter">الإدارة</span>
              </Link>
            ) : (
              <Link href="/dashboard" className={`flex flex-1 flex-col items-center justify-center h-full transition-all active:scale-90 ${isActive('/dashboard') ? 'text-[#0079D3]' : 'text-[#878A8C]'}`}>
                 <svg className="w-6 h-6 mb-1" fill={isActive('/dashboard') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/dashboard') ? "0" : "2.5"} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 <span className="text-[9px] font-black uppercase tracking-tighter">إعلاناتي</span>
              </Link>
            )}

            {/* Account / Signup */}
            <Link 
              href={user ? (isAdmin ? "/admin" : "/profile") : "/auth/register"} 
              className={`flex flex-1 flex-col items-center justify-center h-full transition-all active:scale-90 ${isActive('/profile') || isActive('/auth/register') || isActive('/admin') ? 'text-[#1c1c1c]' : 'text-[#878A8C]'}`}
            >
               <svg className="w-6 h-6 mb-1" fill={isActive('/profile') || isActive('/auth/register') || isActive('/admin') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/profile') || isActive('/auth/register') || isActive('/admin') ? "0" : "2.5"} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
               <span className="text-[9px] font-black uppercase tracking-tighter">{user ? (isAdmin ? 'المدير' : 'حسابي') : 'سجل الآن'}</span>
            </Link>
          </div>

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
