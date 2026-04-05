'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface WhatsAppButtonProps {
  listingId: string
  fullWidth?: boolean
}

export default function WhatsAppButton({
  listingId,
  fullWidth = true,
}: WhatsAppButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
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

      // Open WhatsApp link returned from secure server
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      toast.error('فشل في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn-primary flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold disabled:opacity-70 cursor-pointer shadow-md active:scale-95 transition-all ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.534 5.853L.073 23.447a.5.5 0 00.607.607l5.594-1.461A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.789-.527-5.36-1.446l-.383-.225-3.977 1.039 1.038-3.978-.228-.392A9.967 9.967 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
      <span>{loading ? 'جاري التحقق...' : 'تواصل عبر واتساب'}</span>
    </button>
  )
}

