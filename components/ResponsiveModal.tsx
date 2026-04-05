'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ResponsiveModalProps {
  children: React.ReactNode
  onClose: () => void
  title?: string
}

export default function ResponsiveModal({ children, onClose, title }: ResponsiveModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="modal-overlay sheet-modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-desktop sheet-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden block">
          <div className="sheet-handle" />
        </div>
        
        <div className="p-4 border-b border-[#edeff1] flex items-center justify-between">
          <h3 className="font-bold text-[#1c1c1c] text-lg text-right w-full">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-[#878A8C] hover:text-[#1c1c1c] p-2 hover:bg-[#f6f7f8] rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-0 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
