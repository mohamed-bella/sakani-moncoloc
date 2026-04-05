'use client'

import { useState, useEffect } from 'react'
import FilterBar from '@/components/FilterBar'
import ListingGrid, { ListingGridSkeleton } from '@/components/ListingGrid'
import CityGrid from '@/components/CityGrid'
import WelcomeBanner from '@/components/WelcomeBanner'
import ResponsiveModal from '@/components/ResponsiveModal'
import { FilterState, Listing } from '@/types'
import Link from 'next/link'

const INITIAL_FILTERS: FilterState = {
  q: '',
  city: 'all',
  neighborhood: 'all',
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.city !== 'all') params.set('city', filters.city)
        if (filters.neighborhood && filters.neighborhood !== 'all') params.set('neighborhood', filters.neighborhood)
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

    // Re-fetch when a new listing is posted from the Navbar modal
    const onRefresh = () => fetchListings()
    window.addEventListener('listings:refresh', onRefresh)
    return () => window.removeEventListener('listings:refresh', onRefresh)
  }, [filters])

  return (
    <div className="max-w-[1000px] mx-auto w-full py-6 px-4">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Main Feed Column */}
        <div className="flex-grow w-full min-w-0 flex flex-col gap-4">
          
          <WelcomeBanner />

          {/* Social Media Style 'Create Post' Trigger */}
          <div className="bg-white rounded-xl shadow-sm border border-[#edeff1] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f0f2f5] rounded-full flex items-center justify-center text-[#787C7E] flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <Link 
                href="/post" 
                className="flex-grow bg-[#f0f2f5] hover:bg-[#e4e6e9] text-[#65676B] text-right px-4 py-2.5 rounded-full transition-colors text-sm font-medium cursor-text"
              >
                ماذا يوجد في ذهنك، هل تبحث عن سكن أو شريك؟
              </Link>
            </div>
            <div className="flex border-t border-[#f0f2f5] pt-2 mt-1">
              <Link href="/post" className="flex-1 flex items-center justify-center gap-2 py-1.5 hover:bg-[#f2f2f2] rounded-lg transition-colors text-[#65676B] font-bold text-xs cursor-pointer">
                <span className="text-[#45BD62]"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 14H7v-4h10v4zm0-6H7V7h10v4z"/></svg></span>
                صورة / فيديو
              </Link>
              <Link href="/post" className="flex-1 flex items-center justify-center gap-2 py-1.5 hover:bg-[#f2f2f2] rounded-lg transition-colors text-[#65676B] font-bold text-xs cursor-pointer">
                <span className="text-[#F5533D]"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></span>
                تحديد الموقع
              </Link>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div 
            className="md:hidden card-widget p-3 flex items-center justify-between cursor-pointer hover:bg-[#f6f7f8] transition-colors" 
            onClick={() => setShowMobileFilters(true)}
          >
             <div className="flex items-center gap-2 text-[#1c1c1c] font-bold text-sm">
                <svg className="w-5 h-5 text-[#878A8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                تصفية وبحث
             </div>
             {/* Show active filter indicator if any filters are set */}
             {(filters.city !== 'all' || filters.type !== 'all' || filters.q !== '') && (
                <div className="w-5 h-5 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-xs font-bold leading-none animate-bounce">
                  !
                </div>
             )}
          </div>

          {/* City Explorer Grid */}
          <CityGrid 
            activeCity={filters.city} 
            onCitySelect={(city) => setFilters(prev => ({ ...prev, city, neighborhood: 'all' }))} 
            activeNeighborhood={filters.neighborhood}
            onNeighborhoodSelect={(neighborhood) => setFilters(prev => ({ ...prev, neighborhood }))}
          />

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
            {/* Header banner with gradient */}
            <div className="h-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0071E3 0%, #5E5CE6 100%)' }}>
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 16px 16px, white 1.5px, transparent 0)', backgroundSize: '12px 12px' }}></div>
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-end gap-2 -mt-6 mb-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 relative z-10 shadow-[0_2px_8px_rgba(0,0,0,0.12)] overflow-hidden">
                   <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-base font-bold text-[#1C1C1E] tracking-tight mb-0.5">moncoloc.ma</h2>
              </div>
              <p className="text-sm text-[#48484A] leading-relaxed mb-5 font-normal">
                المجتمع الأول في المغرب للبحث عن شركاء سكن وغرف مشتركة. مساحة مبنية على الثقة والتواصل المباشر.
              </p>
              
              <div className="flex justify-between text-center pb-5 border-b border-[rgba(60,60,67,0.10)] mb-5">
                <div>
                  <div className="text-sm font-bold text-[#1C1C1E]">{listings.length}</div>
                  <div className="text-[11px] font-medium text-[#8E8E93] mt-0.5">إعلان</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1C1C1E]">+12</div>
                  <div className="text-[11px] font-medium text-[#8E8E93] mt-0.5">مدينة</div>
                </div>
                <div>
                   <div className="text-sm font-bold text-[#0071E3]">مجاني</div>
                   <div className="text-[11px] font-medium text-[#8E8E93] mt-0.5">للجميع</div>
                </div>
              </div>

              <Link href="/post" className="w-full btn-primary py-3 rounded-2xl font-semibold text-center text-sm">
                أضف إعلانك
              </Link>
            </div>
          </div>

          {/* Filter Widget (Desktop only) */}
          <div className="hidden md:block">
            {/* Active filter count indicator */}
            {(() => {
              const activeCount = [
                filters.city !== 'all',
                filters.type !== 'all',
                filters.genderPreference !== 'all',
                filters.q.trim() !== '',
                filters.minPrice > 0,
                filters.maxPrice > 0,
              ].filter(Boolean).length
              return activeCount > 0 ? (
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-bold text-[#787C7E]">فلاتر نشطة</span>
                  <span className="bg-[#FF4500] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{activeCount}</span>
                </div>
              ) : null
            })()}
            <FilterBar onFilter={setFilters} initialFilters={filters} />
          </div>

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

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="md:hidden">
          <ResponsiveModal onClose={() => setShowMobileFilters(false)} title="تصفية وبحث">
            <div className="pb-8">
              <FilterBar 
                onFilter={(f) => { 
                  setFilters(f); 
                  // Don't auto-close modal on every input type, close it manually or add a close button inside
                }} 
                initialFilters={filters} 
              />
              <div className="px-4 mt-4">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="btn-primary w-full py-3"
                >
                  إظهار النتائج
                </button>
              </div>
            </div>
          </ResponsiveModal>
        </div>
      )}
    </div>
  )
}
