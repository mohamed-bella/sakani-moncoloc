'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/types'
import { formatPrice, listingTypeLabel } from '@/lib/utils'
import ReportModal from './ReportModal'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reported, setReported] = useState(false)
  
  const firstPhoto = listing.photos?.[0]
  const isRoom = listing.type === 'room_available'

  const handleReportClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setReportModalOpen(true)
  }

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
            setReported(true)
            setTimeout(() => setReported(false), 3000)
          }}
        />
      )}

      {reported && (
        <div className="fixed bottom-6 right-6 bg-[#0079D3] text-white px-4 py-2 rounded shadow-lg z-[110] text-sm font-bold">
           تم الإبلاغ بنجاح
        </div>
      )}

      <div className="bg-white md:rounded-xl shadow-sm border-t border-b md:border border-[#edeff1] mb-6 md:mb-8 overflow-hidden flex flex-col">
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
                <span className="text-[11px] font-bold text-[#878A8C] flex items-center gap-1">
                  {listing.city} {listing.neighborhood && `• ${listing.neighborhood}`}
                </span>
              </div>
            </div>

            <button onClick={handleReportClick} className="text-[#878A8C] hover:text-[#1c1c1c] p-1.5 transition-colors" title="تبليغ">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            </button>
          </div>

          {/* Edge-to-Edge Media */}
          <Link href={`/listing/${listing.id}`} className="block relative w-full aspect-[4/3] sm:aspect-video bg-[#F0F2F5] transition-opacity hover:opacity-95 overflow-hidden">
            {firstPhoto ? (
              <Image
                src={firstPhoto}
                alt={listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-[#878A8C] gap-2 bg-[#e9ecef]">
                 <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-4h10v4zm0-6H7V7h10v4z"/></svg>
                 <span className="text-xs font-bold opacity-60">بدون صور</span>
               </div>
            )}
            
            {/* Overlay Price/Type Tag */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 items-end">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-sm ${isRoom ? 'bg-[#000080] text-white' : 'bg-[#FF4500] text-white'}`}>
                  {listingTypeLabel(listing.type)}
              </span>
              <span className="bg-white/95 backdrop-blur text-[#1c1c1c] px-3 py-1 rounded-full text-sm font-black shadow-md border border-white">
                {formatPrice(listing.price)}
              </span>
            </div>
            
            {/* View Count top left */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-white/10">
               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               {listing.view_count}
            </div>
          </Link>

          {/* Action Row */}
          <div className="px-3 pt-3 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <button className="hover:opacity-60 transition-opacity text-[#1c1c1c]">
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
               </button>
               <Link href={`/listing/${listing.id}`} className="hover:opacity-60 transition-opacity text-[#1c1c1c]">
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
               </Link>
               <button className="hover:opacity-60 transition-opacity text-[#1c1c1c]">
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
               </button>
             </div>
             
             <div className="flex gap-1.5">
               <span className="bg-[#f0f2f5] text-[#1c1c1c] px-2 py-0.5 rounded text-[10px] font-bold border border-[#edeff1]">
                 {listing.gender_preference === 'any' ? 'للجميع' : listing.gender_preference === 'male' ? 'شريك ذكر' : 'شريكة أنثى'}
               </span>
             </div>
          </div>

          {/* Details */}
          <div className="p-3 pt-2 pb-4">
            <Link href={`/listing/${listing.id}`} className="block group">
              <h3 className="text-[1rem] font-bold text-[#1c1c1c] leading-tight mb-1 inline mr-1 group-hover:underline decoration-2 underline-offset-2">{listing.title}</h3>
              <p className="text-sm text-[#1c1c1c] line-clamp-2 leading-relaxed">
                 <span className="font-black text-[#1c1c1c]">{'@'}{listing.profiles?.name?.replace(/\s+/g, '').toLowerCase() || 'user'}</span> {listing.description}
              </p>
            </Link>
          </div>
      </div>
    </>
  )
}
