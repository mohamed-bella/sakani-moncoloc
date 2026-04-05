'use client'

import { useState, useEffect } from 'react'
import { Listing } from '@/types'
import ListingCard from '@/components/ListingCard'
import { ListingGridSkeleton } from '@/components/ListingGrid'
import Link from 'next/link'

export default function SavedListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSaved() {
      try {
        setLoading(true)
        const res = await fetch('/api/listings/saved')
        if (!res.ok) {
          if (res.status === 401) {
             setError('يرجى تسجيل الدخول لعرض المفضلة')
             return
          }
          throw new Error('فشل في جلب البيانات')
        }
        const data = await res.json()
        setListings(data.listings)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSaved()
  }, [])

  return (
    <div className="max-w-[800px] mx-auto w-full py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-[#1c1c1c]">المفضلة</h1>
        <span className="bg-[#f0f2f5] text-[#65676B] px-3 py-1 rounded-full text-sm font-bold">
          {listings.length} إعلانات محفوظة
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <ListingGridSkeleton />
        ) : error ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#edeff1] shadow-sm">
            <p className="text-[#FF4500] font-bold mb-4">{error}</p>
            <Link href="/auth/login" className="btn-primary px-6 py-2">تسجيل الدخول</Link>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#edeff1] shadow-sm">
            <div className="w-20 h-20 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-[#878A8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h2 className="text-xl font-black text-[#1c1c1c] mb-2">قائمتك فارغة</h2>
            <p className="text-[#65676B] mb-8 font-medium">لم تقم بحفظ أي إعلانات بعد. ابدأ باستكشاف ما يناسبك!</p>
            <Link href="/" className="btn-primary px-8 py-3">تصفح الإعلانات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
