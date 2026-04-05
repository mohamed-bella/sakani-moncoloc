'use client'

import { useState } from 'react'
import { FilterState, ListingType } from '@/types'
import { CITIES } from '@/types'

interface FilterBarProps {
  onFilter: (filters: FilterState) => void
  initialFilters: FilterState
}

export default function FilterBar({ onFilter, initialFilters }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const update = (partial: Partial<FilterState>) => {
    const updated = { ...filters, ...partial }
    setFilters(updated)
    onFilter(updated)
  }

  return (
    <div className="card-widget p-4">
      <h3 className="text-xs font-bold text-[#787C7E] uppercase mb-4 tracking-wider">التصنيف والبحث</h3>
      
      <div className="flex flex-col gap-5">
        {/* Search */}
        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5">بحث عن كلمات</label>
          <div className="relative">
            <input
              type="text"
              placeholder="مثال: أكدال، طالب، هادئ..."
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              className="w-full bg-[#f6f7f8] border border-[#edeff1] text-[#1c1c1c] text-sm rounded hover:border-[#0079D3] hover:bg-white focus:bg-white focus:border-[#0079D3] focus:outline-none transition-colors px-3 py-2 pl-8"
            />
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 pointer-events-none text-[#878A8C]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5">المدينة</label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => update({ city: e.target.value })}
              className="w-full bg-[#f6f7f8] border border-[#edeff1] text-[#1c1c1c] text-sm rounded hover:border-[#0079D3] hover:bg-white focus:bg-white focus:border-[#0079D3] focus:outline-none transition-colors px-3 py-2 appearance-none pr-8 cursor-pointer"
            >
              <option value="all">كل المدن</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <div className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none text-[#878A8C]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5">نوع الإعلان</label>
          <div className="flex flex-col gap-1.5">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'room_available', label: 'لدي غرفة للإيجار' },
              { value: 'looking_for_roommate', label: 'أبحث عن غرفة / شريك' },
            ].map((opt) => (
              <label 
                key={opt.value} 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => update({ type: opt.value as 'all' | ListingType })}
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.type === opt.value ? 'bg-[#0079D3] border-[#0079D3]' : 'border-[#ccc] bg-white group-hover:border-[#0079D3]'}`}>
                  {filters.type === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <span className={`text-sm ${filters.type === opt.value ? 'font-medium text-[#1c1c1c]' : 'text-[#787C7E]'}`}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5">التفضيل الجنسي</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'male', label: 'ذكور' },
              { value: 'female', label: 'إناث' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ genderPreference: opt.value as FilterState['genderPreference'] })}
                className={`flex-1 py-1 px-2 rounded-full text-xs font-bold transition-colors ${
                  filters.genderPreference === opt.value
                    ? 'bg-[#E9ECEF] text-[#1c1c1c]'
                    : 'bg-white text-[#787C7E] hover:bg-[#f6f7f8]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5">السعر (د.م)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="من"
              value={filters.minPrice || ''}
              onChange={(e) => update({ minPrice: Number(e.target.value) || 0 })}
              className="flex-1 min-w-0 bg-[#f6f7f8] border border-[#edeff1] rounded px-2 py-1.5 text-sm hover:border-[#0079D3] focus:border-[#0079D3] focus:bg-white focus:outline-none transition-colors"
            />
            <span className="text-[#878A8C]">-</span>
            <input
              type="number"
              placeholder="إلى"
              value={filters.maxPrice || ''}
              onChange={(e) => update({ maxPrice: Number(e.target.value) || 0 })}
              className="flex-1 min-w-0 bg-[#f6f7f8] border border-[#edeff1] rounded px-2 py-1.5 text-sm hover:border-[#0079D3] focus:border-[#0079D3] focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            const reset: FilterState = { q: '', city: 'all', neighborhood: 'all', type: 'all', minPrice: 0, maxPrice: 0, genderPreference: 'all' }
            setFilters(reset)
            onFilter(reset)
          }}
          className="w-full mt-2 py-1.5 px-3 rounded text-sm font-bold text-[#0079D3] hover:bg-[#E9ECEF] transition-colors"
        >
          إعادة ضبط
        </button>
      </div>
    </div>
  )
}
