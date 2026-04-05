'use client'

import { useState, useEffect } from 'react'

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user previously dismissed the banner
    const isDismissed = localStorage.getItem('sakani_welcome_dismissed')
    if (!isDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('sakani_welcome_dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div 
      className="relative overflow-hidden rounded-2xl text-white shadow-xl mb-6 border border-white/10"
      style={{
        backgroundColor: '#3b0764',
        backgroundImage: `
          radial-gradient(at 0% 0%, #7e22ce 0px, transparent 50%),
          radial-gradient(at 100% 0%, #d946ef 0px, transparent 50%),
          radial-gradient(at 100% 100%, #4c1d95 0px, transparent 50%),
          radial-gradient(at 0% 100%, #c026d3 0px, transparent 50%)
        `
      }}
    >
      <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl hidden sm:flex items-center justify-center flex-shrink-0 border border-white/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-xl leading-tight mb-1 text-white">
              مرحباً بك في سكني!
            </h3>
            <p className="text-xs sm:text-sm font-medium text-white/80 leading-snug">
              البحث عن شريك سكنك المستقبلي أصبح أسهل، من الطلاب وللطلاب!
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleClose}
          className="flex-shrink-0 bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors active:scale-95 border border-white/10 cursor-pointer"
          aria-label="إغلاق الإشعار"
        >
          <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
