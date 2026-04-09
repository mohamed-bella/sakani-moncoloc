'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ResponsiveModalProps {
  children: React.ReactNode
  onClose: () => void
  title?: string
}

export default function ResponsiveModal({ children, onClose }: ResponsiveModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Sheet / Dialog */}
      <div
        onClick={e => e.stopPropagation()}
        className="w-full sm:max-w-[500px] bg-white flex flex-col overflow-hidden"
        style={{
          borderRadius: '24px 24px 0 0',
          maxHeight: '96vh',
          animation: 'sheetUp 0.32s cubic-bezier(0.16,1,0.3,1)',
          /* desktop overrides */
        }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-9 h-[4px] rounded-full bg-[rgba(60,60,67,0.18)]" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-[rgba(60,60,67,0.08)] flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#1C1C1E] hover:bg-[#E5E5EA] transition-colors active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[#1C1C1E]">إضافة إعلان</span>
          {/* Spacer to keep title centered */}
          <div className="w-8" />
        </div>

        {/* Content — takes all remaining height */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          [data-modal-inner] {
            border-radius: 24px !important;
            max-height: 88vh;
          }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  )
}
