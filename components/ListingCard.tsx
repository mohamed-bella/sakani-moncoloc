'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Listing } from '@/types'
import { formatPrice, listingTypeLabel, formatDate, getPlaceholderImage } from '@/lib/utils'
import { toast } from 'sonner'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [shareFeedback, setShareFeedback] = useState('')

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      const res = await fetch('/api/listings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsSaved(data.saved)
        toast.success(data.saved ? 'تم الحفظ في المفضلة' : 'تمت الإزالة من المفضلة')
      }
    } catch {
      toast.error('فشل في الحفظ')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    const shareData = {
      title: listing.title,
      text: 'اطلع على هذا الإعلان في موقع moncoloc.ma!',
      url: `${window.location.origin}/listing/${listing.id}`
    }

    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      navigator.clipboard.writeText(shareData.url)
      toast.success('تم نسخ الرابط')
    }
  }

  const isRoom = listing.type === 'room_available'
  const photos = listing.photos || []

  return (
    <div className="card-widget hover:border-[#878A8C] transition-all bg-white flex flex-col group relative">
      
      {/* ── VOTING OVERLAY (Visual only, to sell the aesthetic) ── */}
      <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-[#f8f9fa] hidden md:flex flex-col items-center pt-3 gap-2 border-r border-[#edeff1]">
        <button className="text-[#878A8C] hover:text-[#FF4500] hover:bg-[#e8ecef] rounded p-1 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg></button>
        <span className="text-[11px] font-bold text-[#1A1A1B]">{(listing.view_count % 100) + 1}</span>
        <button className="text-[#878A8C] hover:text-[#7193ff] hover:bg-[#e8ecef] rounded p-1 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg></button>
      </div>

      <div className="md:ml-[40px]">
        {/* Card Header (Meta) */}
        <div className="px-3 pt-3 flex items-center flex-wrap gap-1.5 text-[10px] text-[#787C7E]">
          <div className="w-5 h-5 bg-[#edeff1] rounded-full flex items-center justify-center text-[8px] font-bold text-[#1A1A1B] uppercase">
             {listing.profiles?.name?.charAt(0) || 'U'}
          </div>
          <span className="font-bold text-[#1A1A1B] hover:underline cursor-pointer">
             u/{listing.profiles?.name || 'مستخدم_غير_معروف'}
          </span>
          <span>•</span>
          <span className={`font-black uppercase px-1.5 py-0.5 rounded text-[8px] border border-transparent ${
            isRoom ? 'bg-[#EAF2FF] text-[#0079D3] border-[#0079D3]/20' : 'bg-[#FFF0E5] text-[#FF4500] border-[#FF4500]/20'
          }`}>
             {listingTypeLabel(listing.type)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 hover:underline cursor-pointer">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {listing.city}
          </span>
          <span>•</span>
          <span className="opacity-75">{formatDate(listing.created_at)}</span>
        </div>

        {/* Card Content */}
        <Link href={`/listing/${listing.id}`} className="block px-3 py-3 no-underline group/link">
          <h2 className="text-[1.1rem] font-bold text-[#1A1A1B] mb-2 leading-tight group-hover/link:text-[#0079D3] transition-colors line-clamp-2">
            {listing.title}
          </h2>
          
          <div className="text-[0.9rem] text-[#4A4A4A] line-clamp-3 mb-4 leading-normal whitespace-pre-wrap">
            {listing.description}
          </div>

          {/* Photo Section */}
          {photos.length > 0 && (
            <div className="relative aspect-video w-full rounded-md border border-[#edeff1] overflow-hidden bg-[#F6F7F8] mt-2 mb-2">
              <Image 
                src={photos[0]} 
                alt={listing.title} 
                fill 
                className="object-contain" 
                sizes="500px"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white/95 rounded-md border border-[#edeff1] backdrop-blur-sm">
                <span className="text-[0.95rem] font-black text-[#0079D3] tracking-tighter">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-[9px] font-black opacity-60 uppercase">/ شهر</span>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
             <span className="px-2 py-0.5 rounded-full bg-[#f6f7f8] text-[#878A8C] text-[9px] font-black border border-[#edeff1]">
                {listing.gender_preference === 'male' ? 'للذكور' : listing.gender_preference === 'female' ? 'للإناث' : 'للجميع'}
             </span>
             {listing.tags?.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#0079D3] text-[9px] font-black border border-[#0079D3]/10">
                   {tag}
                </span>
             ))}
          </div>
        </Link>

        {/* Card Footer (Actions) */}
        <div className="px-2 py-1 border-t border-[#edeff1] flex items-center flex-wrap gap-1">
          <Link href={`/listing/${listing.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#e8ecef] text-[#878A8C] text-xs font-bold transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <span>عرض التفاصيل</span>
          </Link>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#e8ecef] text-[#878A8C] text-xs font-bold transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            <span>مشاركة</span>
          </button>

          <button 
            onClick={handleSave}
            disabled={saveLoading}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all text-xs font-bold ${
              isSaved ? 'text-[#0079D3] bg-[#EAF2FF]' : 'text-[#878A8C] hover:bg-[#e8ecef]'
            }`}
          >
            <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            <span>{isSaved ? 'محفوظ' : 'حفظ'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
