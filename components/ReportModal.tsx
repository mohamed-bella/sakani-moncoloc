'use client'

import { useState } from 'react'
import ResponsiveModal from './ResponsiveModal'

interface ReportModalProps {
  listingId: string
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { id: 'fake', label: 'إعلان وهمي / غير حقيقي' },
  { id: 'harassment', label: 'تحرش أو محتوى غير لائق' },
  { id: 'already_rented', label: 'تم كراؤه بالفعل' },
  { id: 'other', label: 'سبب آخر' },
]

export default function ReportModal({ listingId, onClose, onSuccess }: ReportModalProps) {
  const [category, setCategory] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return setError('يرجى اختيار سبب التبليغ')

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, details }),
      })

      if (!res.ok) throw new Error('فشل في إرسال التبليغ')

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ResponsiveModal onClose={onClose} title="تبليغ عن الإعلان">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#787C7E] uppercase tracking-wider block text-right">لماذا تبلغ عن هذا الإعلان؟</label>
          <div className="grid grid-cols-1 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`text-right p-3 rounded border text-sm font-bold transition-all flex items-center justify-between ${
                  category === cat.id 
                    ? 'border-[#0079D3] bg-[#F0F8FF] text-[#0079D3]' 
                    : 'border-[#edeff1] hover:bg-[#f6f7f8] text-[#1c1c1c]'
                }`}
              >
                <span>{cat.label}</span>
                {category === cat.id && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#787C7E] uppercase tracking-wider block text-right">تفاصيل إضافية (اختياري)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="اكتب هنا أي تفاصيل تساعدنا في مراجعة التبليغ..."
            className="w-full h-32 p-3 text-sm border border-[#edeff1] rounded focus:outline-none focus:ring-1 focus:ring-[#0079D3] bg-[#f6f7f8] text-right"
            dir="rtl"
          />
        </div>

        {error && <div className="text-xs text-[#FF4500] font-bold text-right">{error}</div>}

        <div className="flex gap-3 pt-4 pb-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-grow py-3 text-base shadow-sm"
          >
            {submitting ? 'جاري الإرسال...' : 'إرسال التبليغ'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-6 py-2"
          >
            إلغاء
          </button>
        </div>
      </form>
    </ResponsiveModal>
  )
}
