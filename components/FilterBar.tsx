'use client'

import { useState, useEffect, useRef } from 'react'
import { FilterState, ListingType } from '@/types'
import { CITIES } from '@/types'

interface FilterBarProps {
  onFilter: (filters: FilterState) => void
  initialFilters: FilterState
}

export default function FilterBar({ onFilter, initialFilters }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [searchQuery, setSearchQuery] = useState(initialFilters.q)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce the text search — fire API only after user stops typing for 350ms
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const updated = { ...filters, q: searchQuery }
      setFilters(updated)
      onFilter(updated)
    }, 350)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (partial: Partial<FilterState>) => {
    const updated = { ...filters, ...partial }
    setFilters(updated)
    onFilter(updated)
  }

  return (
    <div className="card-widget overflow-hidden shadow-sm">
      <div className="sidebar-widget-header px-4 py-3 text-[11px] font-black tracking-widest uppercase opacity-90">
         فلترة المنشورات
      </div>
      
      <div className="p-5 flex flex-col gap-6">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-black text-[#878A8C] uppercase mb-2 tracking-wider">بحث كلمات</label>
          <div className="relative">
            <input
              type="text"
              placeholder="مثال: أكدال، هادئ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f6f7f8] border border-[#edeff1] text-[#1c1c1c] text-sm rounded-md px-3 py-2 pl-9 hover:border-[#0079D3] focus:bg-white focus:border-[#0079D3] focus:outline-none transition-all placeholder:text-[#AEAEB2]"
            />
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none text-[#878A8C]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-[10px] font-black text-[#878A8C] uppercase mb-2 tracking-wider">المدينة</label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => update({ city: e.target.value })}
              className="w-full bg-[#f6f7f8] border border-[#edeff1] text-[#1c1c1c] text-sm rounded-md px-3 py-2 pr-9 appearance-none hover:border-[#0079D3] focus:bg-white focus:border-[#0079D3] focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">الكل (المغرب)</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none text-[#878A8C]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Type Feed Toggle (Reddit Style) */}
        <div>
           <label className="block text-[10px] font-black text-[#878A8C] uppercase mb-2 tracking-wider">نوع الخلاصة</label>
           <div className="flex flex-col gap-1">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'room_available', label: 'عروض السكن' },
                { value: 'looking_for_roommate', label: 'طلبات السكن' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update({ type: opt.value as 'all' | ListingType })}
                  className={`text-right px-3 py-2 text-sm rounded-md font-bold transition-all ${
                    filters.type === opt.value 
                      ? 'bg-[#f6f7f8] text-[#0079D3]' 
                      : 'text-[#1c1c1c] hover:bg-[#f6f7f8] hover:text-[#0079D3]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
           </div>
        </div>

        {/* Gender Toggle */}
        <div>
          <label className="block text-[10px] font-black text-[#878A8C] uppercase mb-2 tracking-wider">سكن لـ</label>
          <div className="flex bg-[#f6f7f8] p-1 rounded-md border border-[#edeff1]">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'male', label: 'ذكور' },
              { value: 'female', label: 'إناث' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => {
                  e.preventDefault()
                  update({ genderPreference: opt.value as FilterState['genderPreference'] })
                }}
                className={`flex-1 py-1.5 px-1 rounded-md text-[11px] font-black uppercase transition-all ${
                  filters.genderPreference === opt.value
                    ? 'bg-white text-[#0079D3] shadow-sm ring-1 ring-black/5'
                    : 'text-[#878A8C] hover:text-[#1c1c1c]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-[10px] font-black text-[#878A8C] uppercase mb-2 tracking-wider">الميزانية (د.م)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="من"
              value={filters.minPrice || ''}
              onChange={(e) => update({ minPrice: Number(e.target.value) || 0 })}
              className="flex-1 min-w-0 bg-[#f6f7f8] border border-[#edeff1] rounded-md px-3 py-2 text-sm hover:border-[#0079D3] focus:border-[#0079D3] focus:bg-white focus:outline-none transition-all placeholder:text-[#AEAEB2]"
            />
            <span className="text-[#878A8C] font-bold">-</span>
            <input
              type="number"
              placeholder="إلى"
              value={filters.maxPrice || ''}
              onChange={(e) => update({ maxPrice: Number(e.target.value) || 0 })}
              className="flex-1 min-w-0 bg-[#f6f7f8] border border-[#edeff1] rounded-md px-3 py-2 text-sm hover:border-[#0079D3] focus:border-[#0079D3] focus:bg-white focus:outline-none transition-all placeholder:text-[#AEAEB2]"
            />
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            const reset: FilterState = { q: '', city: 'all', neighborhood: 'all', type: 'all', minPrice: 0, maxPrice: 0, genderPreference: 'all' }
            setSearchQuery('')
            setFilters(reset)
            onFilter(reset)
          }}
          className="w-full mt-2 py-2 px-3 rounded-md text-sm font-bold text-[#0079D3] hover:bg-[#f6f7f8] transition-all border border-transparent hover:border-[#edeff1]"
        >
          إعادة ضبط الفلاتر
        </button>
      </div>
    </div>
  )
}
