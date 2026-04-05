'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import WhatsAppButton from '@/components/WhatsAppButton'
import ListingCard from '@/components/ListingCard'
import ReportModal from '@/components/ReportModal'
import { formatPrice, listingTypeLabel, genderPreferenceLabel, formatDate, getPlaceholderImage } from '@/lib/utils'
import { Listing } from '@/types'

interface ListingDetailClientProps {
  initialListing: Listing
  listingId: string
}

export default function ListingDetailClient({ initialListing, listingId }: ListingDetailClientProps) {
  const router = useRouter()
  const [listing, setListing] = useState<Listing>(initialListing)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [shareFeedback, setShareFeedback] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    // Fetch related listings
    fetch(`/api/listings?city=${listing.city}&type=${listing.type}`)
      .then(res => res.json())
      .then(relatedData => {
        const filtered = (relatedData.listings || []).filter((l: Listing) => l.id !== listingId).slice(0, 3)
        setRelatedListings(filtered)
      })
      .catch(() => {})

    // Increment view count
    fetch(`/api/listings/${listingId}/view`, { method: 'POST' }).catch(() => {})

    // Check local storage for saved status
    if (typeof window !== 'undefined') {
       const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]')
       if (saved.includes(listingId)) {
          setIsSaved(true)
       }
    }
  }, [listingId, listing.city, listing.type])

  const handleSave = () => {
    if (typeof window === 'undefined') return
    const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]')
    
    if (isSaved) {
      const updated = saved.filter((savedId: string) => savedId !== listingId)
      localStorage.setItem('saved_listings', JSON.stringify(updated))
      setIsSaved(false)
    } else {
      saved.push(listingId)
      localStorage.setItem('saved_listings', JSON.stringify(saved))
      setIsSaved(true)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: listing.title || 'moncoloc.ma - إعلان',
      text: 'اطلع على هذا الإعلان في موقع moncoloc.ma!',
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Share failed', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShareFeedback('تم نسخ الرابط!')
      setTimeout(() => setShareFeedback(''), 3000)
    }
  }

  const photos = listing.photos || []
  const isRoom = listing.type === 'room_available'

  return (
    <div className="w-full max-w-[1000px] mx-auto py-6 px-4 relative">
      
      {shareFeedback && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1c1c1c] text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-bold animate-pulse">
           {shareFeedback}
        </div>
      )}

      {reportModalOpen && (
        <ReportModal
          listingId={listingId}
          onClose={() => setReportModalOpen(false)}
          onSuccess={() => {
            setReportModalOpen(false)
            setReported(true)
            setTimeout(() => setReported(false), 5000)
          }}
        />
      )}

      {reported && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0079D3] text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-bold">
           شكراً لك! تم استلام بلاغك وسنقوم بمراجعته قريباً.
        </div>
      )}
      
      <div className="mb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#787C7E] hover:text-[#1c1c1c] text-sm font-bold transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-grow w-full min-w-0 card-widget overflow-hidden">
          <div className="p-4 border-b border-[#edeff1]">
            <div className="flex items-center gap-2 mb-2 text-xs text-[#787C7E]">
              <span className="font-bold text-[#1c1c1c]">{listing.profiles?.name || 'مستخدم غير معروف'}</span>
              <span className="mx-1">•</span>
              <span>نُشر في {formatDate(listing.created_at)}</span>
              <span className="mx-1">•</span>
              <span>مشاهدات: {listing.view_count > 0 ? listing.view_count : 'جديد'}</span>
            </div>
            <h1 className="text-xl font-bold text-[#1c1c1c] leading-snug mb-3">
              {listing.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${isRoom ? 'bg-[#0079D3] text-white' : 'bg-[#FF4500] text-white'}`}>
                {listingTypeLabel(listing.type)}
              </span>
              <span className="bg-[#f0f0f0] text-[#1c1c1c] px-2 py-0.5 rounded text-xs font-medium">
                {genderPreferenceLabel(listing.gender_preference)}
              </span>
              <span className="bg-[#f0f0f0] text-[#1c1c1c] px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3 text-[#787C7E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {listing.city} {listing.neighborhood && `- ${listing.neighborhood}`}
              </span>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="bg-[#F8F9FA] border-b border-[#edeff1]">
              <div className="relative h-[400px] w-full bg-[#1A1A1B] flex items-center justify-center">
                <Image src={photos[activePhoto]} alt={listing.title} fill className="object-contain" sizes="(max-width: 1000px) 100vw, 1000px" priority />
                {photos.length > 1 && (
                  <>
                    <button onClick={() => setActivePhoto((prev) => (prev > 0 ? prev - 1 : photos.length - 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    <button onClick={() => setActivePhoto((prev) => (prev < photos.length - 1 ? prev + 1 : 0))} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-[#F8F9FA]">
                  {photos.map((photo, i) => (
                    <button key={i} onClick={() => setActivePhoto(i)} className={`relative w-16 h-16 flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all border-2 ${activePhoto === i ? 'border-[#0079D3] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}><Image src={photo} alt={`صورة ${i + 1}`} fill className="object-cover" /></button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-4 md:p-6 pb-8">
            <h2 className="text-lg font-bold text-[#1c1c1c] mb-3">التفاصيل</h2>
            <div className="text-[#1c1c1c] whitespace-pre-wrap leading-relaxed text-sm">{listing.description}</div>
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-[#edeff1] text-[#878A8C] text-xs font-bold">
               <button onClick={handleShare} className="flex items-center gap-1.5 hover:bg-[#E9ECEF] px-2 py-1.5 rounded transition-colors cursor-pointer"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> مشاركة</button>
               <button onClick={handleSave} className={`flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors cursor-pointer ${isSaved ? 'text-[#FF4500] bg-[#FFF0E5]' : 'hover:bg-[#E9ECEF]'}`}><svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg> {isSaved ? 'تم الحفظ' : 'حفظ'}</button>
               <div className="flex-grow" />
               <button 
                 onClick={() => setReportModalOpen(true)}
                 className="flex items-center gap-1.5 hover:text-[#FF4500] hover:bg-[#FFF0E5] px-2 py-1.5 rounded transition-colors cursor-pointer group"
               >
                 <svg className="w-4 h-4 text-[#878A8C] group-hover:text-[#FF4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 تبليغ
               </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[312px] flex-shrink-0 flex flex-col gap-4">
          <div className="card-widget p-4 sticky top-24">
            <h3 className="text-xs font-bold text-[#787C7E] uppercase mb-4 tracking-wider">السعر المطلوب</h3>
            <div className="text-3xl font-bold text-[#1c1c1c] mb-6 border-b border-[#edeff1] pb-4">
               {formatPrice(listing.price)}
            </div>
            {listing.profiles?.whatsapp ? (
              <WhatsAppButton listingId={listingId} />
            ) : (
              <div className="bg-[#f6f7f8] text-[#787C7E] p-3 rounded text-center text-sm font-bold border border-[#edeff1]">رقم التواصل غير متوفر</div>
            )}
            <div className="mt-4 pt-4 border-t border-[#edeff1] text-xs text-[#787C7E]">
              <span className="font-bold block mb-1">تنبيه أمان:</span>
              لا تقم بتحويل أي مبلغ مقدمًا. ابق معاملاتك المالية مرتبطة بمعاينة العقار.
            </div>
          </div>
        </div>
      </div>

      {relatedListings.length > 0 && (
        <div className="mt-12 pt-12 border-t border-[#ccc]">
          <h2 className="text-xl font-bold text-[#1c1c1c] mb-6">إعلانات مشابهة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((rel) => (<ListingCard key={rel.id} listing={rel} />))}
          </div>
        </div>
      )}
    </div>
  )
}
