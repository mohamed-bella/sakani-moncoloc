'use client'

import { useEffect, useState } from 'react'
import { CITIES } from '@/types'

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
    <div className="mb-2">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold text-[#1c1c1c]">استكشف حسب المدينة</h2>
        {activeCity !== 'all' && (
          <button 
            onClick={() => onCitySelect('all')}
            className="text-xs font-bold text-[#0079D3] hover:underline"
          >
            عرض الكل
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex overflow-hidden gap-3 px-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-[100px] md:w-[120px] h-[100px] flex-shrink-0 bg-[#f0f2f5] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-4 pt-1 px-1 -mx-1 snap-x scroll-smooth gap-3 md:grid md:grid-cols-5 md:overflow-x-visible md:pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CITIES.map((city) => {
            const count = counts[city] || 0;
            const isActive = activeCity === city;
            
            return (
              <button
                key={city}
                onClick={() => onCitySelect(isActive ? 'all' : city)}
                className={`cursor-pointer flex-shrink-0 snap-start relative group overflow-hidden transition-all duration-300 w-[100px] md:w-auto rounded-xl p-3 flex flex-col items-center justify-center gap-2 border-2 ${
                  isActive 
                    ? 'border-[#0079D3] bg-[#0079D3]/5 shadow-sm transform md:-translate-y-1' 
                    : 'border-transparent bg-white shadow-sm hover:border-[#edeff1] hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Icon/Letter Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black z-10 transition-colors ${
                  isActive ? 'bg-[#0079D3] text-white' : 'bg-[#f0f2f5] text-[#1c1c1c] group-hover:bg-[#e4e6e9]'
                }`}>
                  {city.charAt(0)}
                </div>
                
                <span className={`text-xs font-bold z-10 truncate w-full ${isActive ? 'text-[#0079D3]' : 'text-[#1c1c1c]'}`}>
                  {city}
                </span>

                {/* Badge */}
                {count > 0 && (
                  <div className="absolute top-2 left-2 bg-[#FF4500] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full z-10 shadow-sm min-w-[20px] text-center">
                    {count}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Secondary Neighborhood Row */}
      {activeCity !== 'all' && dynamicNeighborhoods[activeCity] && dynamicNeighborhoods[activeCity].length > 0 && (
        <div className="mt-3 flex overflow-x-auto gap-2 px-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => onNeighborhoodSelect('all')}
            className={`cursor-pointer flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${
              activeNeighborhood === 'all' 
                ? 'bg-[#1c1c1c] text-white' 
                : 'bg-[#f0f2f5] text-[#787C7E] hover:bg-[#e4e6e9]'
            }`}
          >
            كل الأحياء
          </button>
          {dynamicNeighborhoods[activeCity].map(neighborhood => (
            <button
              key={neighborhood}
              onClick={() => onNeighborhoodSelect(neighborhood)}
              className={`cursor-pointer flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                activeNeighborhood === neighborhood 
                  ? 'bg-[#0079D3] text-white' 
                  : 'bg-[#f0f2f5] text-[#787C7E] hover:bg-[#e4e6e9]'
              }`}
            >
              {neighborhood}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
