'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import WhatsAppButton from '@/components/WhatsAppButton'
import ListingCard from '@/components/ListingCard'
import ReportModal from '@/components/ReportModal'
import { formatPrice, listingTypeLabel, genderPreferenceLabel, formatDate } from '@/lib/utils'
import { Listing } from '@/types'

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePhoto, setActivePhoto] = useState(0)

  // Feedback States
  const [isSaved, setIsSaved] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
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

        // Initial check for save status
        fetch(`/api/listings/save?listingId=${id}`)
          .then(res => res.json())
          .then(saveData => setIsSaved(saveData.isSaved))
          .catch(() => {})

        // Fetch related listings
        fetch(`/api/listings?city=${data.listing.city}&type=${data.listing.type}`)
          .then(res => res.json())
          .then(relatedData => {
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
  }, [id])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id })
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/auth/register?redirectTo=/listing/${id}`)
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
        // user aborted
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('✅ تم نسخ الرابط!')
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1000px] mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow w-full bg-white rounded-3xl p-6 min-h-[500px] border border-[#edeff1]">
             <div className="h-8 w-1/2 skeleton mb-6 rounded-xl" />
             <div className="h-[400px] w-full skeleton mb-6 rounded-3xl" />
             <div className="h-4 w-3/4 skeleton mb-2 rounded-xl" />
             <div className="h-4 w-1/2 skeleton mb-6 rounded-xl" />
          </div>
          <div className="w-full md:w-[312px] bg-white rounded-3xl border border-[#edeff1] p-6 h-[240px] skeleton flex-shrink-0" />
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="w-full max-w-[1000px] mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl border border-[#edeff1] shadow-xl p-12 inline-block">
          <h2 className="text-xl font-black text-[#1c1c1c] mb-6 tracking-tight">{error || 'الإعلان غير موجود'}</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-[#0079D3] text-white px-8 py-3 rounded-2xl font-black transition-all hover:bg-[#0062ab] active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  const photos = listing.photos || []
  const isRoom = listing.type === 'room_available'
  const isHighlyResponsive = listing.profiles?.last_seen_at 
    && (new Date().getTime() - new Date(listing.profiles.last_seen_at).getTime()) < 24 * 60 * 60 * 1000;

  return (
    <div className="w-full max-w-[1000px] mx-auto py-6 px-4 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#0079D3] text-white px-6 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,121,211,0.3)] z-[100] text-sm font-black border border-white/20 animate-in fade-in slide-in-from-top-4">
           {toastMessage}
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
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#2b8a3e] text-white px-6 py-3 rounded-2xl shadow-xl z-[100] text-sm font-black border border-white/20 animate-in fade-in slide-in-from-top-4">
           🚀 شكراً لك! تم استلام بلاغك وسنقوم بمراجعته قريباً.
        </div>
      )}
      
      {/* Pending Approval Notice (For Owner/Admin) */}
      {listing.status === 'pending' && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-200 shrink-0">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-yellow-800 mb-1">هذا الإعلان بانتظار موافقة الإدارة</h3>
              <p className="text-sm font-bold text-yellow-700/80 leading-relaxed">
                سيتم نشر هذا الإعلان للعموم فور مراجعته. نهدف من ذلك حماية المجتمع من السبام والإعلانات الوهمية.
              </p>
            </div>
          </div>
          <a 
            href={`https://wa.me/212704969534?text=${encodeURIComponent(`مرحباً، لقد قمت بنشر إعلان بعنوان "${listing.title}" وأرغب في تفعيله بسرعة.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-green-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
             <svg className="w-5 h-5 mb-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
             </svg>
             تفعيل سريع عبر واتساب
          </a>
        </div>
      )}

      {/* Go Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#787C7E] hover:text-[#0079D3] text-sm font-black transition-all cursor-pointer active:scale-90 group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-[#edeff1] flex items-center justify-center transition-all group-hover:border-[#0079D3]/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          العودة للمقترحات
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start pb-20">
        
        {/* Main Post Content */}
        <div className="flex-grow w-full min-w-0 bg-white rounded-3xl border border-[#edeff1] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Post Header */}
          <div className="p-5 md:p-8 border-b border-[#f0f2f5]">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-gradient-to-tr from-[#0079D3] to-[#FF4500] rounded-full p-[2px]">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1c1c1c] text-xl font-black">
                   {listing.profiles?.name ? listing.profiles.name.charAt(0).toUpperCase() : 'U'}
                 </div>
               </div>
               <div className="flex flex-col text-right">
                  <div className="flex items-center gap-2">
                     <span className="font-black text-[1.1rem] text-[#1c1c1c] leading-none">{listing.profiles?.name || 'مستخدم سكني'}</span>
                     {isHighlyResponsive && (
                        <span className="flex items-center gap-1 bg-[#d3f9d8] text-[#2b8a3e] px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide border border-[#b2f2bb] shadow-sm">
                           نشط اليوم
                        </span>
                     )}
                  </div>
                  <span className="text-xs font-bold text-[#65676B] mt-1 opacity-75">
                    نُشر في {formatDate(listing.created_at)} • {listing.view_count} مشاهدة
                  </span>
               </div>
            </div>

            <h1 className="text-2xl font-black text-[#1c1c1c] leading-tight mb-6 tracking-tight">
              {listing.title}
            </h1>
            <div className="flex flex-wrap gap-2.5">
              <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm border ${isRoom ? 'bg-[#e7f3ff] text-[#0079D3] border-[#0079D3]/20' : 'bg-[#fff0e5] text-[#ff4500] border-[#ff4500]/20'}`}>
                {listingTypeLabel(listing.type)}
              </span>
              <span className="bg-[#f0f2f5] text-[#65676B] px-4 py-1.5 rounded-xl text-xs font-black border border-[#edeff1]">
                {genderPreferenceLabel(listing.gender_preference)}
              </span>
              <span className="bg-[#f0f2f5] text-[#65676B] px-4 py-1.5 rounded-xl text-xs font-black border border-[#edeff1] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#0079D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {listing.city} {listing.neighborhood && `- ${listing.neighborhood}`}
              </span>
            </div>
          </div>

          {/* Photo Viewer */}
          {photos.length > 0 && (
            <div className="bg-[#F8F9FA] border-b border-[#f0f2f5]">
              <div className="relative h-[300px] md:h-[520px] w-full bg-[#fbfbfb] flex items-center justify-center">
                <Image
                  src={photos[activePhoto]}
                  alt={listing.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1000px) 100vw, 1000px"
                  priority
                />
                
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhoto((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-[#1c1c1c] rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl border border-[#f0f2f5] active:scale-90 z-20"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button
                      onClick={() => setActivePhoto((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white text-[#1c1c1c] rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl border border-[#f0f2f5] active:scale-90 z-20"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  </>
                )}
              </div>

              {photos.length > 1 && (
                <div className="flex gap-4 p-5 overflow-x-auto bg-white border-t border-[#f0f2f5]">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden transition-all border-4 shadow-sm ${
                        activePhoto === i ? 'border-[#0079D3] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
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
          <div className="p-6 md:p-10 pb-12">
            <h2 className="text-xl font-black text-[#1c1c1c] mb-5 tracking-tight">التفاصيل الكاملة</h2>
            <div className="text-[#1c1c1c] whitespace-pre-wrap leading-relaxed text-[1.05rem] font-medium opacity-90">
              {listing.description}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 mt-12 pt-8 border-t border-[#f0f2f5] text-[#65676B] text-sm font-black">
               <button 
                 onClick={handleShare}
                 className="flex items-center gap-2 hover:bg-[#f0f2f5] px-6 py-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 border border-transparent hover:border-[#edeff1]"
               >
                 <svg className="w-6 h-6 text-[#0079D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                 مشاركة 
               </button>
                <button 
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all cursor-pointer active:scale-95 border ${isSaved ? 'text-[#0079D3] bg-[#e7f3ff] border-[#0079D3]/40' : 'hover:bg-[#f0f2f5] border-transparent hover:border-[#edeff1]'}`}
                >
                  <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                  {isSaved ? 'تم الحفظ في المفضلة' : 'حفظ الإعلان'}
                </button>
                <div className="flex-grow" />
                <button 
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-2 hover:text-[#FF4500] hover:bg-red-50 px-6 py-3.5 rounded-2xl transition-all cursor-pointer group active:scale-95 font-bold"
                >
                  <svg className="w-6 h-6 text-[#878A8C] group-hover:text-[#FF4500]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  تبليغ عن مخالفة
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar / CTA */}
        <div className="w-full md:w-[312px] flex-shrink-0 flex flex-col gap-6 md:sticky md:top-24">
          <div className="bg-white rounded-[2rem] border border-[#edeff1] shadow-[0_8px_40px_rgb(0,0,0,0.05)] p-8 overflow-hidden">
            <h3 className="text-[10px] font-black text-[#65676B] uppercase mb-5 tracking-[0.2em] opacity-60">السعر الشهري</h3>
            <div className="text-4xl font-black text-[#1c1c1c] mb-8 flex items-baseline gap-1">
               {formatPrice(listing.price)}
               <span className="text-sm font-bold text-[#65676B] tracking-normal opacity-70">/ شهر</span>
            </div>
            
            <div className="space-y-4">
               <WhatsAppButton 
                 listingId={listing.id} 
                 initialNumber={listing.whatsapp_number}
               />
            </div>

            <div className="mt-10 pt-8 border-t border-[#f0f2f5]">
              <div className="bg-blue-50/70 p-5 rounded-3xl border border-blue-100/50">
                <span className="font-black text-[#0079D3] text-[11px] uppercase tracking-wider block mb-3">💡 تنبيه أمان</span>
                <p className="text-[11px] font-bold text-[#65676B] leading-relaxed opacity-90">
                  لا تقم بتحويل أي مبالغ مقدمًا قبل معاينة الغرفة والتأكد من هوية صاحب الإعلان. ابق معاملاتك آمنة.
                </p>
              </div>
            </div>
          </div>
          
          {/* Related Ads Sidebar */}
          <div className="hidden md:block">
             <h4 className="text-[11px] font-black text-[#65676B] uppercase mb-5 px-3 tracking-widest opacity-60">إعلانات مشابهة</h4>
             <div className="space-y-5">
                {relatedListings.map(rel => (
                  <Link key={rel.id} href={`/listing/${rel.id}`} className="block group">
                    <div className="flex gap-4 bg-white p-2.5 rounded-3xl border border-transparent hover:border-[#edeff1] hover:shadow-xl transition-all active:scale-95">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden relative flex-shrink-0 bg-[#f0f2f5] shadow-inner">
                        {rel.photos?.[0] ? (
                           <Image src={rel.photos[0]} alt={rel.title} fill className="object-cover transition-transform group-hover:scale-110" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-[#65676B]">Sakani</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[0.95rem] font-black text-[#1c1c1c] truncate mb-1 group-hover:text-[#0079D3] transition-colors">{rel.title}</span>
                        <span className="text-sm font-black text-[#0079D3]">{formatPrice(rel.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>
        
      </div>

      {/* Mobile Related Listings */}
      {relatedListings.length > 0 && (
        <div className="mt-12 pt-12 border-t border-[#f0f2f5] md:hidden">
          <h2 className="text-2xl font-black text-[#1c1c1c] mb-8 px-2 tracking-tight">إعلانات مشابهة قد تهمك</h2>
          <div className="grid grid-cols-1 gap-6">
            {relatedListings.map((rel) => (
              <ListingCard key={rel.id} listing={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
