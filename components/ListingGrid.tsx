'use client'

import { Listing, FilterState } from '@/types'
import ListingCard from './ListingCard'
import Link from 'next/link'
import { useMemo } from 'react'

interface ListingGridProps {
  listings: Listing[]
  filters: FilterState
}

export default function ListingGrid({ listings, filters }: ListingGridProps) {
  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (filters.city && filters.city !== 'all' && l.city !== filters.city) return false
      if (filters.type !== 'all' && l.type !== filters.type) return false
      if (l.price < filters.minPrice) return false
      if (filters.maxPrice > 0 && l.price > filters.maxPrice) return false
      if (
        filters.genderPreference !== 'all' &&
        l.gender_preference !== filters.genderPreference
      )
        return false
      return true
    })
  }, [listings, filters])

  if (filtered.length === 0) {
    return (
      <div className="card-widget p-12 flex flex-col items-center justify-center bg-white text-center min-h-[300px]">
        <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#787C7E] mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 className="text-lg font-bold text-[#1c1c1c] mb-2">
          لا توجد نتائج مطابقة
        </h3>
        <p className="text-[#878A8C] text-sm mb-6 max-w-sm">
          لم نتمكن من العثور على أي إعلانات تتطابق مع المرشحات الحالية. جرب تقليل شروط البحث.
        </p>
        <Link href="/post" className="btn-primary">
          أو أضف إعلانك الجديد
        </Link>
      </div>
    )
  }

  return (
    <>
      {filtered.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </>
  )
}

// Compact Feed Loading skeleton
export function ListingGridSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card-widget flex overflow-hidden opacity-70">
          <div className="w-[40px] bg-[#F8F9FA] border-l border-[#edeff1] hidden sm:block flex-shrink-0" />
          <div className="p-3 flex-grow">
            <div className="h-3 w-1/4 skeleton mb-3" />
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-grow">
                <div className="h-5 w-3/4 skeleton mb-2" />
                <div className="h-5 w-1/2 skeleton mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 skeleton rounded-full" />
                  <div className="h-6 w-16 skeleton rounded-full" />
                </div>
              </div>
              <div className="h-[98px] w-full md:w-[140px] skeleton rounded flex-shrink-0" />
            </div>
            <div className="flex gap-4 mt-4">
              <div className="h-4 w-20 skeleton" />
              <div className="h-4 w-16 skeleton" />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
