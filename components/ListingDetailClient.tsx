'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import WhatsAppButton from '@/components/WhatsAppButton'
import ListingCard from '@/components/ListingCard'
import ReportModal from '@/components/ReportModal'
import { formatPrice, listingTypeLabel, genderPreferenceLabel, formatDate } from '@/lib/utils'
import { Listing } from '@/types'
import { toast } from 'sonner'

interface ListingDetailClientProps {
  initialListing: Listing
  listingId: string
}

export default function ListingDetailClient({ initialListing, listingId }: ListingDetailClientProps) {
  const router = useRouter()
  const historyLengthOnMount = useRef<number>(0)
  const [listing, setListing] = useState<Listing>(initialListing)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    historyLengthOnMount.current = window.history.length

    fetch(`/api/listings?city=${listing.city}&type=${listing.type}`)
      .then(res => res.json())
      .then(relatedData => {
        const filtered = (relatedData.listings || []).filter((l: Listing) => l.id !== listingId).slice(0, 3)
        setRelatedListings(filtered)
      })
      .catch(() => {})

    fetch(`/api/listings/${listingId}/view`, { method: 'POST' }).catch(() => {})

    fetch(`/api/listings/save?listingId=${listingId}`)
      .then(res => res.json())
      .then(data => setIsSaved(data.isSaved))
      .catch(() => {})
  }, [listingId, listing.city, listing.type])

  const handleGoBack = () => {
    if (window.history.length <= 2 || historyLengthOnMount.current <= 1) {
      router.push('/')
    } else {
      router.back()
    }
  }

  const handleSave = async () => {
    setSaveLoading(true)
    try {
      const res = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsSaved(data.saved)
        toast.success(data.saved ? 'تم الحفظ في المفضلة' : 'تمت الإزالة من المفضلة')
      }
    } catch {
      toast.error('فشل في الحفظ')
    } finally { setSaveLoading(false) }
  }

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: 'اطلع على هذا الإعلان في موقع moncoloc.ma!',
      url: window.location.href
    }

    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('تم نسخ الرابط')
    }
  }

  const photos = listing.photos || []
  const isRoom = listing.type === 'room_available'

  return (
    <div className="w-full max-w-[1240px] mx-auto py-5 px-4">
      
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

      {/* Back to Home / Subreddit */}
      <div className="mb-4">
        <button 
          onClick={handleGoBack}
          className="flex items-center gap-2 text-[#787C7E] hover:text-[#1A1A1B] text-xs font-bold transition-all transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة للرئيسية
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ── MAIN POST AREA ── */}
        <div className="flex-grow w-full min-w-0 flex flex-col gap-4">
          <div className="card-widget relative">
            
            {/* Voting Sidebar (Visual) */}
            <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-[#f8f9fa] hidden md:flex flex-col items-center pt-5 gap-3 border-r border-[#edeff1]">
              <button className="text-[#878A8C] hover:text-[#FF4500] p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"></path></svg></button>
              <span className="text-sm font-bold text-[#1A1A1B]">{Math.floor(listing.view_count / 10) + 1}</span>
              <button className="text-[#878A8C] hover:text-[#7193ff] p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg></button>
            </div>

            <div className="md:ml-[40px]">
              {/* Header Meta */}
              <div className="p-3 md:p-4 pb-0 flex items-center flex-wrap gap-2 text-[11px] text-[#787C7E]">
                <div className="w-6 h-6 bg-[#edeff1] rounded-full flex items-center justify-center text-[10px] font-bold text-[#1A1A1B]">
                  {listing.profiles?.name?.charAt(0) || 'U'}
                </div>
                <span className="font-bold text-[#1A1A1B]">u/{listing.profiles?.name || 'مستخدم_غير_معروف'}</span>
                <span>•</span>
                <span className="font-bold">{formatDate(listing.created_at)}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isRoom ? 'bg-[#0079D3] text-white' : 'bg-[#FF4500] text-white'}`}>
                  {listingTypeLabel(listing.type)}
                </span>
                <span className="flex-grow" />
                <button 
                  onClick={() => setReportModalOpen(true)}
                  className="text-[#FF4500] hover:bg-[#FF4500]/10 px-2 py-1 rounded transition-colors"
                >
                  تبليغ
                </button>
              </div>

              {/* Title & Body */}
              <div className="p-3 md:p-5 md:pt-4">
                <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1B] leading-snug mb-5">
                  {listing.title}
                </h1>

                {/* Photo Viewer */}
                {photos.length > 0 && (
                  <div className="bg-black rounded-lg overflow-hidden mb-6 relative group">
                    <div className="relative h-[300px] md:h-[500px] w-full flex items-center justify-center">
                      <Image src={photos[activePhoto]} alt={listing.title} fill className="object-contain" priority />
                      {photos.length > 1 && (
                        <>
                          <button onClick={() => setActivePhoto((prev) => (prev > 0 ? prev - 1 : photos.length - 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></button>
                          <button onClick={() => setActivePhoto((prev) => (prev < photos.length - 1 ? prev + 1 : 0))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
                        </>
                      )}
                    </div>
                    {photos.length > 1 && (
                      <div className="flex gap-2 p-2 overflow-x-auto bg-[#1A1A1B] border-t border-white/10">
                        {photos.map((photo, i) => (
                          <button key={i} onClick={() => setActivePhoto(i)} className={`relative w-14 h-14 flex-shrink-0 rounded border-2 transition-all ${activePhoto === i ? 'border-[#0079D3] scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}><Image src={photo} alt={`صورة ${i + 1}`} fill className="object-cover" /></button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[#1A1A1B] whitespace-pre-wrap leading-relaxed text-[1rem] font-medium opacity-90 mb-8">
                  {listing.description}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#edeff1]">
                   <span className="px-3 py-1 rounded-full bg-[#f6f7f8] text-[#878A8C] text-xs font-bold border border-[#edeff1]">
                      سكن لـ: {genderPreferenceLabel(listing.gender_preference)}
                   </span>
                   {listing.tags?.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full bg-[#EAF2FF] text-[#0079D3] text-xs font-bold border border-[#0079D3]/10">
                         {tag}
                      </span>
                   ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-2 border-t border-[#edeff1] flex items-center flex-wrap gap-2 text-[#878A8C] font-bold text-xs">
                <button className="flex items-center gap-2 p-2 hover:bg-[#e8ecef] rounded transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span>التعليقات</span>
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 p-2 hover:bg-[#e8ecef] rounded transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  <span>مشاركة</span>
                </button>
                <button onClick={handleSave} disabled={saveLoading} className={`flex items-center gap-2 p-2 hover:bg-[#e8ecef] rounded transition-colors ${isSaved ? 'text-[#0079D3]' : ''}`}>
                  <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments Placeholder */}
          <div className="card-widget p-10 text-center flex flex-col items-center justify-center gap-3 border-dashed border-2 border-[#ccc]/50 bg-[#F6F7F8]/50">
             <svg className="w-12 h-12 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             <p className="text-sm font-bold text-[#878A8C]">لا توجد تعليقات بعد... كن أول من يضيف تعليقاً!</p>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="w-full lg:w-[312px] flex-shrink-0 flex flex-col gap-4 sticky top-[68px]">
          
          {/* About Widget */}
          <div className="card-widget">
            <div className="sidebar-widget-header">حول {listing.city}</div>
            <div className="p-4">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#0079D3] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {listing.city.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-[#1A1A1B]">r/{listing.city}</h4>
                    <p className="text-[10px] font-bold text-[#878A8C]">{listing.city}, المغرب</p>
                  </div>
               </div>
               <p className="text-xs text-[#1A1A1B] leading-relaxed mb-4 font-medium">
                  مجتمع المهتمين بالسكن والبحث عن أصدقاء السكن في مدينة {listing.city}. انضم إلينا لمعرفة آخر العروض.
               </p>
               <div className="flex border-t border-[#edeff1] pt-4 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-black text-[#1A1A1B]">9.4k</p>
                    <p className="text-[10px] font-bold text-[#878A8C]">عضو</p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1A1A1B]">128</p>
                    <p className="text-[10px] font-bold text-[#878A8C]">متصل الآن</p>
                  </div>
               </div>
               <button className="btn-primary w-full shadow-none" onClick={() => router.push(`/?city=${listing.city}`)}>تصفح المدينة</button>
            </div>
          </div>

          {/* Pricing & Contact Widget */}
          <div className="card-widget p-5 bg-[#F6F7F8] border-[#0079D3]/20">
             <div className="text-[10px] font-black text-[#878A8C] uppercase mb-4 tracking-widest leading-none">السعر المطلوب</div>
             <div className="text-3xl font-black text-[#1A1A1B] mb-5 pb-5 border-b border-[#edeff1]">
                {formatPrice(listing.price)}
                <span className="text-xs font-bold text-[#878A8C] tracking-normal mb-1">/ شهر</span>
             </div>
             <WhatsAppButton listingId={listingId} initialNumber={listing.whatsapp_number} />
             <div className="mt-4 p-3 bg-white border border-[#edeff1] rounded-xl">
                <span className="text-[10px] font-bold text-[#FF4500] uppercase block mb-1">💡 نصيحة أمان</span>
                <p className="text-[10px] text-[#7C7C7C] leading-snug">
                   لا تدفع أي مبلغ مالي قبل معاينة السكن والتأكد من هوية المعلن. الصدق والأمان أولويتنا.
                </p>
             </div>
          </div>

        </div>
      </div>
      
      {/* Related Feed */}
      {relatedListings.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[#edeff1]">
          <h3 className="text-sm font-bold text-[#878A8C] uppercase mb-6 tracking-widest">إعلانات مشابهة في {listing.city}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedListings.map((rel) => (<ListingCard key={rel.id} listing={rel} />))}
          </div>
        </div>
      )}
    </div>
  )
}
