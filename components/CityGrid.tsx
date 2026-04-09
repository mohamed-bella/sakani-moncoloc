'use client'

import { useEffect, useState } from 'react'
import { CITIES } from '@/types'

const CITY_META: Record<string, { emoji: string; label: string }> = {
  'Agadir':     { emoji: '🌊', label: 'أكادير' },
  'Casablanca': { emoji: '🏢', label: 'الدار البيضاء' },
  'Rabat':      { emoji: '🏛️', label: 'الرباط' },
  'Fès':        { emoji: '🕌', label: 'فاس' },
  'Marrakech':  { emoji: '🌿', label: 'مراكش' },
  'Meknès':     { emoji: '🍇', label: 'مكناس' },
  'Tanger':     { emoji: '⛵', label: 'طنجة' },
  'Oujda':      { emoji: '🌄', label: 'وجدة' },
  'Laayoune':   { emoji: '🏜️', label: 'العيون' },
  'Dakhla':     { emoji: '🏄', label: 'الداخلة' },
}

interface CityGridProps {
  onCitySelect: (city: string) => void;
  activeCity: string;
  onNeighborhoodSelect: (neighborhood: string) => void;
  activeNeighborhood: string;
}

export default function CityGrid({ onCitySelect, activeCity, onNeighborhoodSelect, activeNeighborhood }: CityGridProps) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [dynamicNeighborhoods, setDynamicNeighborhoods] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/cities/stats')
        if (res.ok) {
          const data = await res.json()
          setCounts(data.counts || {})
          setDynamicNeighborhoods(data.neighborhoods || {})
        }
      } catch (e) {
        console.error("Failed to fetch city stats", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[11px] font-black text-[#878A8C] tracking-widest uppercase">تجمعات المدن المستحسنة</h2>
        {activeCity !== 'all' && (
          <button 
            onClick={() => onCitySelect('all')}
            className="text-[11px] font-bold text-[#0079D3] hover:underline"
          >
            عرض الكل
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex overflow-hidden gap-3 px-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-[120px] h-[48px] flex-shrink-0 bg-[#f6f7f8] animate-pulse rounded-full border border-[#edeff1]" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-4 px-1 -mx-1 snap-x scroll-smooth gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CITIES.map((city) => {
            const count = counts[city] || 0;
            const isActive = activeCity === city;
            const meta = CITY_META[city] || { emoji: city.charAt(0), label: city };
            
            return (
              <button
                key={city}
                onClick={() => onCitySelect(isActive ? 'all' : city)}
                className={`cursor-pointer flex-shrink-0 snap-start relative group transition-all duration-200 py-2 px-4 flex items-center gap-3 rounded-full border ${
                  isActive 
                    ? 'bg-[#0079D3] border-[#0079D3] text-white' 
                    : 'bg-white border-[#edeff1] hover:border-[#878A8C] text-[#1c1c1c]'
                }`}
              >
                {/* Reddit-style Community Icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${
                  isActive ? 'bg-white text-[#0079D3]' : 'bg-[#0079D3] text-white'
                }`}>
                  {city.charAt(0)}
                </div>
                
                <div className="flex flex-col items-start leading-none gap-0.5">
                   <span className={`text-[12px] font-bold ${isActive ? 'text-white' : 'text-[#1c1c1c]'}`}>
                      r/{city}
                   </span>
                   <span className={`text-[9px] font-black opacity-60 ${isActive ? 'text-white' : 'text-[#878A8C]'}`}>
                      {count} منشور
                   </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Secondary Neighborhood Row (Integrated as Subreddits) */}
      {activeCity !== 'all' && dynamicNeighborhoods[activeCity] && dynamicNeighborhoods[activeCity].length > 0 && (
        <div className="mt-2 flex overflow-x-auto gap-2 px-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => onNeighborhoodSelect('all')}
            className={`cursor-pointer flex-shrink-0 text-[10px] font-bold px-4 py-1.5 rounded-md border transition-all ${
              activeNeighborhood === 'all' 
                ? 'bg-[#1A1A1B] text-white border-[#1A1A1B]' 
                : 'bg-[#f6f7f8] text-[#878A8C] border-[#edeff1] hover:bg-[#e8ecef]'
            }`}
          >
            كل الأحياء
          </button>
          {dynamicNeighborhoods[activeCity].map(neighborhood => (
            <button
              key={neighborhood}
              onClick={() => onNeighborhoodSelect(neighborhood)}
              className={`cursor-pointer flex-shrink-0 text-[10px] font-bold px-4 py-1.5 rounded-md border transition-all ${
                activeNeighborhood === neighborhood 
                  ? 'bg-[#0079D3] text-white border-[#0079D3]' 
                  : 'bg-[#f6f7f8] text-[#878A8C] border-[#edeff1] hover:bg-[#e8ecef]'
              }`}
            >
              u/{neighborhood.replace(/\s+/g, '_')}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
