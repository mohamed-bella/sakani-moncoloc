'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DashboardListingActions({ 
  listingId, 
  currentStatus,
  isLocked,
  bumpedAt
}: { 
  listingId: string, 
  currentStatus: 'active' | 'closed',
  isLocked: boolean
  bumpedAt?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const bumpListing = async () => {
    if (isLocked) return
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await fetch(`/api/listings/${listingId}/bump`, {
        method: 'POST'
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'فشل في رفع الإعلان')
      }
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate cooldown
  const cooldownHours = 12
  let hoursSinceBump = cooldownHours
  if (bumpedAt) {
    hoursSinceBump = (new Date().getTime() - new Date(bumpedAt).getTime()) / (1000 * 60 * 60)
  }
  const canBump = hoursSinceBump >= cooldownHours && currentStatus === 'active' && !isLocked
  const remainingHours = Math.ceil(cooldownHours - hoursSinceBump)

  const toggleStatus = async () => {
    if (isLocked) {
      setErrorMessage('هذا الإعلان مقفل من قبل الإدارة ولا يمكن إعادة تفعيله.')
      return
    }
    
    setLoading(true)
    setErrorMessage(null)
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active'
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'فشل في تحديث حالة الإعلان')
      }
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteListing = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      alert('فشل في حذف الإعلان')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="bg-red-50 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded border border-red-100 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-300 hover:text-red-500 font-black">×</button>
        </div>
      )}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#edeff1] text-xs font-bold text-[#878A8C]">
        <button
          onClick={() => router.push(`/listing/${listingId}`)}
          className="flex items-center gap-1.5 hover:bg-[#E9ECEF] px-2 py-1.5 rounded transition-colors cursor-pointer text-[#0079D3]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          عرض
        </button>

        <button
          onClick={bumpListing}
          disabled={loading || !canBump}
          title={!canBump && currentStatus === 'active' ? `متاح بعد ${remainingHours} ساعات` : ''}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50 ${
            canBump ? 'bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20' : 'text-[#878A8C] hover:bg-[#E9ECEF]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          {canBump ? 'رفع للقمة' : `متاح خلال ${remainingHours}س`}
        </button>
        
        <button
          onClick={toggleStatus}
          disabled={loading}
          className={`flex items-center gap-1.5 hover:bg-[#E9ECEF] px-2 py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50 ${isLocked ? 'text-red-400 opacity-60' : ''}`}
        >
          {isLocked ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {isLocked ? 'إيقاف إداري' : (currentStatus === 'active' ? 'إغلاق الإعلان' : 'إعادة التفعيل')}
        </button>
        
        <button
          onClick={deleteListing}
          disabled={loading}
          className="flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 px-2 py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          حذف
        </button>
      </div>
    </div>
  )
}
