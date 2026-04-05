'use client'

import { useState, useEffect } from 'react'
import FilterBar from '@/components/FilterBar'
import ListingGrid, { ListingGridSkeleton } from '@/components/ListingGrid'
import { FilterState, Listing } from '@/types'
import Link from 'next/link'

const INITIAL_FILTERS: FilterState = {
  q: '',
  city: 'all',
  type: 'all',
  minPrice: 0,
  maxPrice: 0,
  genderPreference: 'all',
}

const TIPS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
    ),
    title: 'حافظ على سلامتك',
    text: 'لا ترسل أي مبالغ مالية قبل معاينة السكن والتأكد من هوية صاحب الإعلان.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    ),
    title: 'تواصل بوضوح',
    text: 'اتفق على كافة التفاصيل المشتركة والفواتير عبر واتساب ليكون كل شيء موثقاً.',
  },
]

export default function Home(props: {
  params: Promise<any>
  searchParams: Promise<any>
}) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.city !== 'all') params.set('city', filters.city)
        if (filters.type !== 'all') params.set('type', filters.type)
        if (filters.genderPreference !== 'all') params.set('genderPreference', filters.genderPreference)
        if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString())
        if (filters.maxPrice > 0) params.set('maxPrice', filters.maxPrice.toString())
        if (filters.q.trim()) params.set('q', filters.q.trim())
        
        const query = params.toString()
        const res = await fetch(`/api/listings${query ? `?${query}` : ''}`)
        if (!res.ok) throw new Error('فشل في جلب الإعلانات')
        const data = await res.json()
        setListings(data.listings)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [filters])

  return (
    <div className="max-w-[1000px] mx-auto w-full py-6 px-4">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Main Feed Column */}
        <div className="flex-grow w-full min-w-0 flex flex-col gap-4">
          
          {/* Create Post Banner */}
          <div className="card-widget p-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#787C7E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <Link 
              href="/post" 
              className="flex-grow bg-[#E9ECEF] hover:bg-[#DAE0E6] text-[#787C7E] px-4 py-2 rounded border border-[#E9ECEF] transition-colors text-sm font-bold"
            >
              هل تبحث عن شريك سكن أو لديك غرفة؟ أضف إعلانك هنا...
            </Link>
          </div>

          {/* Feed Header */}
          <div className="card-widget p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-[#1c1c1c]">أحدث الإعلانات</span>
              <span className="bg-[#f0f0f0] text-[#787C7E] px-2 py-0.5 rounded text-xs font-bold">
                {listings.length}
              </span>
            </div>
          </div>

          {/* Feed Content */}
          <div className="flex flex-col gap-3">
            {loading ? (
              <ListingGridSkeleton />
            ) : error ? (
              <div className="card-widget p-6 text-center text-[#FF4500] font-bold italic">
                {error}
              </div>
            ) : (
              <ListingGrid listings={listings} filters={filters} />
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="w-full md:w-[312px] flex-shrink-0 flex flex-col gap-4">
          
          {/* About Widget */}
          <div className="card-widget overflow-hidden">
            <div className="h-10 bg-[#000080] relative overflow-hidden">
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '10px 10px' }}></div>
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-end gap-2 -mt-6 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 relative z-10 border-2 border-[#edeff1] overflow-hidden">
                   <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-lg font-black text-[#1c1c1c] tracking-tight mb-0.5">moncoloc.ma</h2>
              </div>
              <p className="text-sm text-[#1c1c1c] leading-relaxed mb-6 font-medium">
                المجتمع الأول في المغرب للبحث عن شركاء سكن وغرف مشتركة. مساحة مبنية على الثقة والتواصل المباشر.
              </p>
              
              <div className="flex justify-between text-center pb-6 border-b border-[#f0f0f0] mb-6">
                <div>
                  <div className="text-sm font-black text-[#1c1c1c]">{listings.length}</div>
                  <div className="text-[10px] font-bold text-[#787C7E] uppercase tracking-widest">إعلان</div>
                </div>
                <div>
                  <div className="text-sm font-black text-[#1c1c1c]">+12</div>
                  <div className="text-[10px] font-bold text-[#787C7E] uppercase tracking-widest">مدينة</div>
                </div>
                <div>
                   <div className="text-sm font-black text-[#000080]">مجاني</div>
                   <div className="text-[10px] font-bold text-[#787C7E] uppercase tracking-widest">للجميع</div>
                </div>
              </div>

              <Link href="/post" className="w-full bg-[#000080] text-white py-3 rounded-xl font-black text-center flex items-center justify-center transition-all hover:bg-blue-900 active:scale-95">
                أضف إعلانك
              </Link>
            </div>
          </div>

          {/* Filter Widget */}
          <FilterBar onFilter={setFilters} initialFilters={filters} />

          {/* Tips Widget */}
          <div className="card-widget p-6">
            <h3 className="text-[10px] font-black text-[#787C7E] uppercase mb-5 tracking-[0.1em]">نصائح وإرشادات</h3>
            <div className="flex flex-col gap-6">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-[#000080] mt-1">
                    {tip.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#1c1c1c] mb-1.5">{tip.title}</h4>
                    <p className="text-xs text-[#787C7E] leading-relaxed font-bold">{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer links */}
          <div className="text-[10px] font-bold text-[#787C7E] px-2 mb-8 uppercase tracking-wider">
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
              <Link href="/about" className="hover:text-[#1c1c1c] transition-colors">المساعدة</Link>
              <Link href="/privacy" className="hover:text-[#1c1c1c] transition-colors">الخصوصية</Link>
              <Link href="/privacy" className="hover:text-[#1c1c1c] transition-colors">الشروط</Link>
            </div>
            <p>moncoloc.ma © 2026. جميع الحقوق محفوظة.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
