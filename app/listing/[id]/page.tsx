'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import WhatsAppButton from '@/components/WhatsAppButton'
import ListingCard from '@/components/ListingCard'
import ReportModal from '@/components/ReportModal'
import { formatPrice, listingTypeLabel, genderPreferenceLabel, formatDate, getPlaceholderImage } from '@/lib/utils'
import { Listing } from '@/types'

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)

  // Save State
  const [isSaved, setIsSaved] = useState(false)
  
  // Share Alert State
  const [shareFeedback, setShareFeedback] = useState('')
  
  // Report State
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('الإعلان غير موجود')
          throw new Error('حدث خطأ أثناء جلب الإعلان')
        }
        const data = await res.json()
        setListing(data.listing)

        // Fetch related listings
        fetch(`/api/listings?city=${data.listing.city}&type=${data.listing.type}`)
          .then(res => res.json())
          .then(relatedData => {
            // Filter out current listing
            const filtered = (relatedData.listings || []).filter((l: Listing) => l.id !== id).slice(0, 3)
            setRelatedListings(filtered)
          })
          .catch(() => {})

        // Increment view count
        fetch(`/api/listings/${id}/view`, { method: 'POST' }).catch(() => {})
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
    
    // Check local storage for saved status
    if (typeof window !== 'undefined') {
       const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]')
       if (saved.includes(id)) {
          setIsSaved(true)
       }
    }
  }, [id])

  const handleSave = () => {
    if (typeof window === 'undefined') return
    const saved = JSON.parse(localStorage.getItem('saved_listings') || '[]')
    
    if (isSaved) {
      const updated = saved.filter((savedId: string) => savedId !== id)
      localStorage.setItem('saved_listings', JSON.stringify(updated))
      setIsSaved(false)
    } else {
      saved.push(id)
      localStorage.setItem('saved_listings', JSON.stringify(saved))
      setIsSaved(true)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: listing?.title || 'سكني - إعلان',
      text: 'اطلع على هذا الإعلان في موقع سكني!',
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Share failed', err)
      }
    } else {
      // Fallback for desktop/unsupported browsers
      navigator.clipboard.writeText(window.location.href)
      setShareFeedback('تم نسخ الرابط!')
      setTimeout(() => setShareFeedback(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1000px] mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow w-full card-widget p-4 min-h-[500px]">
             <div className="h-6 w-1/2 skeleton mb-4" />
             <div className="h-[300px] w-full skeleton mb-4" />
             <div className="h-4 w-3/4 skeleton mb-2" />
             <div className="h-4 w-1/2 skeleton mb-6" />
          </div>
          <div className="w-full md:w-[312px] card-widget p-4 h-[200px] skeleton flex-shrink-0" />
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="w-full max-w-[1000px] mx-auto py-12 px-4 text-center">
        <div className="card-widget p-12 inline-block">
          <h2 className="text-xl font-bold text-[#1c1c1c] mb-4">{error || 'الإعلان غير موجود'}</h2>
          <button
            onClick={() => router.push('/')}
            className="btn-primary cursor-pointer"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  const photos = listing.photos || []
  const isRoom = listing.type === 'room_available'

  // Calculate if the user has been active in the last 24 hours
  const isHighlyResponsive = listing.profiles?.last_seen_at 
    && (new Date().getTime() - new Date(listing.profiles.last_seen_at).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div className="w-full max-w-[1000px] mx-auto py-6 px-4 relative">
      
      {/* Share Toast Notification */}
      {shareFeedback && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1c1c1c] text-white px-4 py-2 rounded shadow-lg z-50 text-sm font-bold animate-pulse">
           {shareFeedback}
        </div>
      )}

      {reportModalOpen && (
        <ReportModal
          listingId={id as string}
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
      
      {/* Go Back Button */}
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
        
        {/* Main Post Content */}
        <div className="flex-grow w-full min-w-0 card-widget overflow-hidden">
          {/* Post Header */}
          <div className="p-4 border-b border-[#edeff1]">
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-[#787C7E]">
              <span className="font-bold text-[#1c1c1c]">{listing.profiles?.name || 'مستخدم غير معروف'}</span>
              
              {isHighlyResponsive && (
                <span className="flex items-center gap-1 bg-[#d3f9d8] text-[#2b8a3e] px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide border border-[#b2f2bb] shadow-sm animate-in fade-in">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                  يَرُد بسرعة
                </span>
              )}

              <span className="mx-0.5">•</span>
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

          {/* Photo Viewer */}
          {photos.length > 0 && (
            <div className="bg-[#F8F9FA] border-b border-[#edeff1]">
              <div className="relative h-[400px] w-full bg-[#1A1A1B] flex items-center justify-center">
                <Image
                  src={photos[activePhoto]}
                  alt={listing.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1000px) 100vw, 1000px"
                  priority
                />
                
                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhoto((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                      onClick={() => setActivePhoto((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-[#F8F9FA]">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`relative w-16 h-16 flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all border-2 ${
                        activePhoto === i ? 'border-[#0079D3] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={photo} alt={`صورة ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Post Description */}
          <div className="p-4 md:p-6 pb-8">
            <h2 className="text-lg font-bold text-[#1c1c1c] mb-3">التفاصيل</h2>
            <div className="text-[#1c1c1c] whitespace-pre-wrap leading-relaxed text-sm">
              {listing.description}
            </div>

            {/* Action Bar (Reddit Style) */}
            <div className="flex items-center gap-4 mt-8 pt-4 border-t border-[#edeff1] text-[#878A8C] text-xs font-bold">
               <button 
                 onClick={handleShare}
                 className="flex items-center gap-1.5 hover:bg-[#E9ECEF] px-2 py-1.5 rounded transition-colors cursor-pointer"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                 مشاركة
               </button>
                <button 
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors cursor-pointer ${isSaved ? 'text-[#FF4500] bg-[#FFF0E5]' : 'hover:bg-[#E9ECEF]'}`}
                >
                  <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                  {isSaved ? 'تم الحفظ' : 'حفظ'}
                </button>
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

        {/* Sidebar / CTA */}
        <div className="w-full md:w-[312px] flex-shrink-0 flex flex-col gap-4">
          <div className="card-widget p-4 sticky top-24">
            <h3 className="text-xs font-bold text-[#787C7E] uppercase mb-4 tracking-wider">السعر المطلوب</h3>
            <div className="text-3xl font-bold text-[#1c1c1c] mb-6 border-b border-[#edeff1] pb-4">
               {formatPrice(listing.price)}
            </div>
            
            {listing.profiles?.has_whatsapp ? (
              <WhatsAppButton
                listingId={listing.id}
              />
            ) : (
              <Link href={`/auth/login?redirectTo=/listing/${listing.id}`} className="block w-full bg-[#f6f7f8] hover:bg-[#E9ECEF] text-[#1c1c1c] p-3 rounded text-center text-sm font-bold border border-[#edeff1] transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-[#878A8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  سجل الدخول لإظهار رقم التواصل
                </div>
              </Link>
            )}

            <div className="mt-4 pt-4 border-t border-[#edeff1] text-xs text-[#787C7E]">
              <span className="font-bold block mb-1">تنبيه أمان:</span>
              لا تقم بتحويل أي مبلغ مقدمًا. ابق معاملاتك المالية مرتبطة بمعاينة العقار.
            </div>
          </div>
        </div>
        
      </div>

      {/* Related Listings Section */}
      {relatedListings.length > 0 && (
        <div className="mt-12 pt-12 border-t border-[#ccc]">
          <h2 className="text-xl font-bold text-[#1c1c1c] mb-6">إعلانات مشابهة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((rel) => (
              <ListingCard key={rel.id} listing={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
