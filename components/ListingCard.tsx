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

      <Link href={`/listing/${listing.id}`} className="card-widget block hover:border-[#898989] transition-colors overflow-hidden relative group">
        <div className="flex flex-col sm:flex-row">
          
          {/* Vote Column (Dummy visual element to mimic Reddit structure) */}
          <div className="hidden sm:flex flex-col items-center p-2 bg-[#F8F9FA] border-l border-[#edeff1] min-w-[40px]">
            <svg className="w-6 h-6 text-[#878A8C] hover:text-[#FF4500] hover:bg-[#E9ECEF] rounded cursor-pointer p-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
            <span className="text-xs font-bold text-[#1c1c1c] my-1">
              {listing.view_count > 0 ? listing.view_count : '•'}
            </span>
            <svg className="w-6 h-6 text-[#878A8C] hover:text-[#7193ff] hover:bg-[#E9ECEF] rounded cursor-pointer p-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>

          {/* Minimal Mobile Vote Header */}
          <div className="sm:hidden flex items-center justify-between px-3 pt-2 pb-1 border-b border-[#edeff1] bg-[#F8F9FA]">
             <div className="flex items-center gap-1">
               <span className="text-[0.65rem] font-bold text-[#787C7E]">مشاهدات:</span>
               <span className="text-[0.65rem] font-bold text-[#1c1c1c]">{listing.view_count > 0 ? listing.view_count : 'جديد'}</span>
             </div>
          </div>

          {/* Content Area */}
          <div className="p-3 flex-grow min-w-0">
            
            {/* Top Meta Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#787C7E]">
                <span className="font-bold text-[#1c1c1c]">مُعلن</span>
                
                {isHighlyResponsive && (
                  <span className="flex items-center gap-1 bg-[#d3f9d8] text-[#2b8a3e] px-1.5 py-0.5 rounded text-[10px] font-black tracking-wide border border-[#b2f2bb] shadow-sm animate-in fade-in">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                    يَرُد بسرعة
                  </span>
                )}

                <span className="mx-0.5 hidden sm:inline">•</span>
                <span>
                  {listing.city} {listing.neighborhood && `- ${listing.neighborhood}`}
                </span>
              </div>
              
              {/* Report Flag (Visible on hover on desktop, always small on mobile) */}
              <button 
                onClick={handleReportClick}
                className="text-[#878A8C] hover:text-[#FF4500] p-1 rounded hover:bg-[#FF4500]/10 transition-colors sm:opacity-0 group-hover:opacity-100"
                title="تبليغ"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-2">
              
              {/* Title & Tags */}
              <div className="flex-grow">
                <h3 className="text-[1.1rem] font-semibold text-[#1c1c1c] leading-snug mb-2 line-clamp-2">
                  {listing.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isRoom ? 'bg-[#0079D3] text-white' : 'bg-[#FF4500] text-white'}`}>
                    {listingTypeLabel(listing.type)}
                  </span>
                  <span className="bg-[#f0f0f0] text-[#1c1c1c] px-2 py-0.5 rounded-full text-xs font-medium">
                    {listing.gender_preference === 'any' ? 'للجميع' : listing.gender_preference === 'male' ? 'ذكور' : 'إناث'}
                  </span>

                </div>
                <p className="text-[#1c1c1c] text-sm hidden md:block line-clamp-3 leading-relaxed opacity-80">
                  {listing.description}
                </p>
              </div>

              {/* Thumbnail Image (Right aligned) */}
              {firstPhoto && (
                <div className="relative w-full md:w-[140px] h-[180px] md:h-[98px] rounded flex-shrink-0 bg-[#F0F2F5] border border-[#edeff1] overflow-hidden">
                  <Image
                    src={firstPhoto}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 140px"
                  />
                </div>
              )}
            </div>

            {/* Bottom Action Row */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-[#878A8C] hover:bg-[#E9ECEF] p-1.5 rounded transition-colors text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{formatPrice(listing.price)}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[#878A8C] hover:bg-[#E9ECEF] p-1.5 rounded transition-colors text-xs font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <span>تواصل</span>
              </div>
            </div>
            
          </div>
        </div>
      </Link>
    </>
  )
}
