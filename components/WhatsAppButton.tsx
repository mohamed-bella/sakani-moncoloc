'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface WhatsAppButtonProps {
  listingId: string
  fullWidth?: boolean
  initialNumber?: string
}

export default function WhatsAppButton({
  listingId,
  fullWidth = true,
  initialNumber,
}: WhatsAppButtonProps) {
  const [loading, setLoading] = useState(false)
  const [revealedNumber, setRevealedNumber] = useState<string | null>(initialNumber || null)
  const [revealedUrl, setRevealedUrl] = useState<string | null>(null)

  const handleReveal = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/reveal`, { 
        method: 'POST' 
      })

      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || 'حدث خطأ غير متوقع')
        return
      }

      if (data.number) {
        setRevealedNumber(data.number)
        setRevealedUrl(data.url)
        // Also open WhatsApp if the user clicked the initial button
        if (data.url) {
           window.open(data.url, '_blank', 'noopener,noreferrer')
        }
      }
    } catch (err) {
      toast.error('فشل في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (revealedNumber) {
      navigator.clipboard.writeText(revealedNumber)
      toast.success('تم نسخ الرقم بنجاح')
    }
  }

  if (revealedNumber) {
    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
        <div className="flex items-center gap-2 p-1.5 bg-[#F2F2F7] rounded-2xl border border-[rgba(60,60,67,0.12)]">
          {/* Number Display Row */}
          <div className="flex-1 flex flex-col px-4 py-2 border-l border-[rgba(60,60,67,0.08)]">
            <span className="text-[10px] font-semibold text-[#8E8E93] mb-0.5">رقم الواتساب</span>
            <span className="text-[1.1rem] font-bold text-[#1C1C1E]" dir="ltr">{revealedNumber}</span>
          </div>

          <button
            onClick={handleCopy}
            className="w-12 h-12 flex items-center justify-center text-[#0071E3] hover:bg-[#EAF2FF] rounded-xl transition-all active:scale-90"
            title="نسخ الرقم"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => window.open(revealedUrl!, '_blank')}
          className="bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-[0.95rem] font-bold shadow-[0_4px_14px_rgba(37,211,102,0.25)] active:scale-95 transition-all w-full"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.534 5.853L.073 23.447a.5.5 0 00.607.607l5.594-1.461A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.789-.527-5.36-1.446l-.383-.225-3.977 1.039 1.038-3.978-.228-.392A9.967 9.967 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          فتح محادثة واتساب
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleReveal}
      disabled={loading}
      className={`bg-[#0071E3] hover:bg-[#0058b0] text-white flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-[0.95rem] font-bold disabled:opacity-70 cursor-pointer shadow-[0_8px_24px_rgba(0,113,227,0.25)] active:scale-95 transition-all outline-none border-none ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {loading ? (
         <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.534 5.853L.073 23.447a.5.5 0 00.607.607l5.594-1.461A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.789-.527-5.36-1.446l-.383-.225-3.977 1.039 1.038-3.978-.228-.392A9.967 9.967 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      )}
      <span>{loading ? 'جاري الاتصال...' : 'تواصل عبر واتساب'}</span>
    </button>
  )
}
