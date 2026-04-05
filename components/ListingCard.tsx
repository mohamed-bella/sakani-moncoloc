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
          showToast('يرجى تسجيل الدخول لحفظ الإعلانات')
          return
        }
        throw new Error()
      }

      const data = await res.json()
      setIsSaved(data.saved)
      showToast(data.saved ? 'تم حفظ الإعلان في المفضلة' : 'تمت الإزالة من المفضلة')
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
        <div className="fixed bottom-24 right-6 bg-[#1c1c1c] text-white px-4 py-2.5 rounded-lg shadow-xl z-[110] text-sm font-bold animate-in fade-in slide-in-from-bottom-5">
           {toastMessage}
        </div>
      )}

      <div 
        onClick={handleCardClick}
        className={`bg-white md:rounded-xl shadow-sm border-t border-b md:border border-[#edeff1] mb-6 md:mb-8 overflow-hidden flex flex-col cursor-pointer transition-all hover:bg-[#f6f7f8]/30 relative ${isClosed ? 'opacity-80' : ''}`}
      >
          {isClosed && (
            <div className="absolute inset-0 z-10 bg-white/40 flex items-center justify-center pointer-events-none">
              <span className="bg-[#1c1c1c] text-white px-4 py-2 rounded-lg font-black text-sm rotate-[-5deg] border-2 border-white shadow-xl">
                 إعلان منتهي
              </span>
            </div>
          )}

          {/* Top Header */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#000080] to-[#FF4500] rounded-full flex items-center justify-center text-white font-bold shadow-sm p-[2px]">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1c1c1c] text-[1rem]">
                   {listing.profiles?.name ? listing.profiles.name.charAt(0).toUpperCase() : 'U'}
                 </div>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[0.9rem] font-bold text-[#1c1c1c] flex items-center gap-1">
                  {listing.profiles?.name || 'مستخدم'}
                  {isHighlyResponsive && (
                    <span className="flex items-center gap-0.5 text-[#2b8a3e] bg-[#d3f9d8] px-1 rounded-[4px] text-[9px] font-black tracking-wide border border-[#b2f2bb] ml-1">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                      يَرُد بسرعة
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-bold text-[#65676B] flex items-center gap-1">
                  {listing.city} {listing.neighborhood && `• ${listing.neighborhood}`} 
                  <span className="mx-1">•</span> 
                  {getRelativeTime(listing.created_at)}
                </span>
              </div>
            </div>

            <button onClick={handleReportClick} className="text-[#878A8C] hover:text-[#1c1c1c] p-1.5 transition-colors relative z-20" title="تبليغ">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a1 1 0 100-2 1 1 0 000 2zM12 10a1 1 0 100 2 1 1 0 000-2zM12 14a1 1 0 100 2 1 1 0 000-2z" /></svg>
            </button>
          </div>

          {/* Details & Tags (Above Media) */}
          <div className="px-3 pb-3">
             <div className="flex justify-between items-start mb-2 gap-3">
               <h3 className="text-[1.05rem] font-bold text-[#050505] leading-snug">
                 {listing.title}
               </h3>
               <span className="text-[#1877f2] font-black text-base bg-[#e7f3ff] px-2.5 py-1 rounded-lg flex-shrink-0 shadow-sm border border-[#1877f2]/10 tracking-tight">
                 {formatPrice(listing.price)}
               </span>
             </div>
             
             {/* Clear Visual Tags */}
             <div className="flex flex-wrap gap-2 mb-2.5">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold shadow-sm ${isRoom ? 'bg-[#e7f3ff] text-[#1877f2] border border-[#1877f2]/20' : 'bg-[#fce8e6] text-[#c9302c] border border-[#c9302c]/20'}`}>
                  {isRoom ? (
                     <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                  ) : (
                     <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                  )}
                  {listingTypeLabel(listing.type)}
                </div>
                
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold bg-[#f0f2f5] text-[#65676B] border border-[#ccd0d5] shadow-sm">
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                   {listing.gender_preference === 'any' ? 'متاح للجميع' : listing.gender_preference === 'male' ? 'مطلوب ذكور فقط' : 'مطلوب إناث فقط'}
                </div>
             </div>

             <div className="text-[0.95rem] text-[#050505] line-clamp-3 leading-relaxed whitespace-pre-line">
                 {listing.description}
             </div>
          </div>

          {/* Conditional Media (No Placeholder) */}
          {firstPhoto && (
            <div className="block relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#F0F2F5] transition-opacity hover:opacity-95 overflow-hidden border-t border-b border-[#f0f2f5]">
                <Image
                  src={firstPhoto}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
            </div>
          )}

          {/* Action Row */}
          <div className="px-3 py-1.5 flex items-center justify-between bg-white mt-1 relative z-20">
             <div className="flex items-center gap-2 flex-grow">
               <button onClick={handleSave} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 hover:bg-[#f2f2f2] px-3 py-2 rounded-lg transition-colors font-bold text-sm ${isSaved ? 'text-[#1877f2]' : 'text-[#65676B] hover:text-[#1c1c1c]'}`}>
                 <svg className="w-5 h-5 flex-shrink-0" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                 <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
               </button>
               <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[#65676B] hover:text-[#1c1c1c] hover:bg-[#f2f2f2] px-3 py-2 rounded-lg transition-colors font-bold text-sm">
                 <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                 <span>مشاركة</span>
               </button>
             </div>
             
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 router.push(`/listing/${listing.id}`);
               }}
               className="flex items-center gap-2 bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#050505] px-4 py-2 rounded-lg transition-colors font-bold text-sm shadow-sm flex-shrink-0 min-w-fit"
             >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                تواصل
             </button>
          </div>
      </div>
    </>
  )
}
