'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Listing } from '@/types'
import { formatPrice, listingTypeLabel, getRelativeTime } from '@/lib/utils'
import ReportModal from './ReportModal'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter()
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Initial check for save status
    const checkSave = async () => {
      try {
        const res = await fetch(`/api/listings/save?listingId=${listing.id}`)
        const data = await res.json()
        setIsSaved(data.isSaved)
      } catch (err) {
        // Silently fail if not logged in or network error
      }
    }
    checkSave()
  }, [listing.id])
  
  const firstPhoto = listing.photos?.[0]
  const isRoom = listing.type === 'room_available'

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setReportModalOpen(true)
  }

  const showToast = (message: string) => {
     setToastMessage(message)
     setTimeout(() => setToastMessage(null), 3000)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/listing/${listing.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: 'شاهد هذا الإعلان على سكني',
          url: url,
        })
      } catch (err) {
        // user aborted share, do nothing
      }
    } else {
      navigator.clipboard.writeText(url)
      showToast('تم نسخ الرابط للحافظة')
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const res = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id })
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/register?redirectTo=/listing/${listing.id}`)
          return
        }
        throw new Error()
      }

      const data = await res.json()
      setIsSaved(data.saved)
      showToast(data.saved ? '✨ تم الحفظ في المفضلة' : 'تمت الإزالة من المفضلة')
    } catch (err) {
      showToast('حدث خطأ أثناء الحفظ')
    }
  }

  const handleCardClick = () => {
    router.push(`/listing/${listing.id}`)
  }

  const isClosed = listing.status === 'closed'

  // 24 Hour window for "Highly Responsive" / "Active Today"
  const isHighlyResponsive = listing.profiles?.last_seen_at 
    && (new Date().getTime() - new Date(listing.profiles.last_seen_at).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <>
      {reportModalOpen && (
        <ReportModal
          listingId={listing.id}
          onClose={() => setReportModalOpen(false)}
          onSuccess={() => {
            setReportModalOpen(false)
            showToast('تم الإبلاغ بنجاح')
          }}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-24 right-6 bg-[#0079D3] text-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,121,211,0.3)] z-[110] text-sm font-black animate-in fade-in slide-in-from-bottom-5 border border-white/20">
           {toastMessage}
        </div>
      )}

      <div 
        onClick={handleCardClick}
        className={`bg-white md:rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-t border-b md:border border-[#edeff1] mb-4 md:mb-8 overflow-hidden flex flex-col cursor-pointer transition-all hover:bg-[#f6f7f8]/50 active:scale-[0.995] relative group ${isClosed ? 'opacity-80' : ''}`}
      >
          {isClosed && (
            <div className="absolute inset-0 z-10 bg-white/40 flex items-center justify-center pointer-events-none">
              <span className="bg-[#1c1c1c] text-white px-4 py-2 rounded-lg font-black text-xs rotate-[-5deg] border-2 border-white shadow-xl uppercase tracking-widest">
                 إعلان منتهي
              </span>
            </div>
          )}

          {/* Top Header */}
          <div className="p-3 md:p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-tr from-[#0079D3] to-[#FF4500] rounded-full flex items-center justify-center text-white font-bold shadow-sm p-[1.5px]">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1c1c1c] text-sm md:text-[1.1rem] font-black">
                   {listing.profiles?.name ? listing.profiles.name.charAt(0).toUpperCase() : 'U'}
                 </div>
              </div>
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[0.9rem] md:text-[1rem] font-black text-[#1c1c1c] hover:underline truncate max-w-[120px] md:max-w-none">
                    {listing.profiles?.name || 'مستخدم'}
                  </span>
                  {isHighlyResponsive && (
                    <span className="flex items-center gap-0.5 text-[#2b8a3e] bg-[#d3f9d8] px-1.5 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black tracking-wide border border-[#b2f2bb] shadow-sm flex-shrink-0">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                      نشط اليوم
                    </span>
                  )}
                </div>
                <span className="text-[10px] md:text-[11px] font-bold text-[#65676B] flex items-center gap-1 opacity-70 mt-1 md:mt-1.5">
                  {listing.city} {listing.neighborhood && `• ${listing.neighborhood}`} 
                  <span className="mx-1">•</span> 
                  {getRelativeTime(listing.created_at)}
                </span>
              </div>
            </div>

            <button onClick={handleReportClick} className="text-[#878A8C] hover:text-[#FF4500] hover:bg-red-50 p-2 rounded-full transition-all relative z-20 cursor-pointer active:scale-90" title="تبليغ">
              <svg className="w-5 h-5 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a1 1 0 100-2 1 1 0 000 2zM12 10a1 1 0 100 2 1 1 0 000-2zM12 14a1 1 0 100 2 1 1 0 000-2z" /></svg>
            </button>
          </div>

          {/* Details & Tags */}
          <div className="px-3 md:px-5 pb-3">
             <div className="flex justify-between items-start mb-2.5 gap-3">
               <h3 className="text-[1.05rem] md:text-[1.15rem] font-black text-[#050505] leading-snug tracking-tight">
                 {listing.title}
               </h3>
               <span className="text-[#0079D3] font-black text-[1rem] md:text-[1.1rem] bg-[#e7f3ff] px-3 py-1 rounded-xl flex-shrink-0 shadow-sm border border-[#0079D3]/10 tracking-tight">
                 {formatPrice(listing.price)}
               </span>
             </div>
             
             <div className="flex flex-wrap gap-2 mb-3.5">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider shadow-sm transition-transform hover:scale-105 ${isRoom ? 'bg-[#e7f3ff] text-[#0079D3] border border-[#0079D3]/20' : 'bg-[#fff0e5] text-[#ff4500] border border-[#ff4500]/20'}`}>
                  {listingTypeLabel(listing.type)}
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider bg-[#f0f2f5] text-[#65676B] border border-[#ccd0d5] shadow-sm hover:scale-105 transition-transform">
                   {listing.gender_preference === 'any' ? 'متاح للجميع' : listing.gender_preference === 'male' ? 'ذكور' : 'إناث'}
                </div>
             </div>

             <div className="text-[0.92rem] md:text-[0.98rem] text-[#050505] line-clamp-2 leading-relaxed whitespace-pre-line font-medium opacity-80 mb-1">
                 {listing.description}
             </div>
          </div>

          {/* Optimized Media */}
          {firstPhoto && (
            <div className="block relative w-full aspect-[16/9] bg-[#F0F2F5] transition-opacity hover:opacity-95 overflow-hidden md:border-t md:border-b border-[#f0f2f5]/40 mt-1 shadow-inner">
                <Image
                  src={firstPhoto}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
            </div>
          )}

          {/* Action Row */}
          <div className="px-3 md:px-5 py-3 md:py-4 flex items-center justify-between bg-white relative z-20 border-t border-[#f0f2f5]">
             <div className="flex items-center gap-1 sm:gap-2 flex-grow min-w-0">
               <button 
                onClick={handleSave} 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-[#f0f2f5] px-4 md:px-5 py-2.5 rounded-2xl transition-all font-black text-xs md:text-sm cursor-pointer active:scale-95 ${isSaved ? 'text-[#0079D3] bg-[#e7f3ff] border-[#0079D3]/20' : 'text-[#65676B] hover:text-[#1c1c1c] border border-transparent'}`}
               >
                 <svg className="w-5 h-5 flex-shrink-0" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                 <span className="hidden xs:inline">{isSaved ? 'محفوظ' : 'حفظ'}</span>
               </button>
               <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[#65676B] hover:text-[#1c1c1c] hover:bg-[#f0f2f5] px-4 md:px-5 py-2.5 rounded-2xl transition-all font-black text-xs md:text-sm cursor-pointer active:scale-95">
                 <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                 <span className="hidden xs:inline">مشاركة</span>
               </button>
             </div>
             
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 router.push(`/listing/${listing.id}`);
               }}
               className="flex items-center gap-2 bg-[#0079D3] hover:bg-[#0062ab] text-white px-6 md:px-8 py-3 rounded-2xl transition-all font-black text-xs md:text-sm shadow-[0_8px_25px_rgba(0,121,211,0.25)] active:scale-95 cursor-pointer flex-shrink-0"
             >
                تواصل الآن
             </button>
          </div>
      </div>
    </>
  )
}
