'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
}

export default function ImageUploader({ files, onChange, maxFiles = 5 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    const valid = Array.from(newFiles).filter((f) => {
      if (!validTypes.includes(f.type)) {
        alert(`الملف "${f.name}" غير مدعوم. يُقبل فقط JPG, PNG, WEBP`)
        return false
      }
      if (f.size > maxSize) {
        alert(`الملف "${f.name}" كبير جداً. الحد الأقصى 5MB`)
        return false
      }
      return true
    })

    const combined = [...files, ...valid].slice(0, maxFiles)
    onChange(combined)
  }

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[#1877F2] bg-[#1877F2]/5'
            : 'border-[#E9EDEF] hover:border-[#1877F2]/50 hover:bg-[#F0F2F5]'
        } ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <svg className="w-10 h-10 mx-auto mb-3 text-[#65676B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-[#050505] font-medium mb-1">
          {files.length >= maxFiles
            ? `وصلت للحد الأقصى (${maxFiles} صور)`
            : 'اسحب وأفلت الصور هنا أو انقر للاختيار'}
        </p>
        <p className="text-xs text-[#65676B]">
          JPG, PNG, WEBP — حتى 5MB لكل صورة — {files.length}/{maxFiles} صور
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image
                src={URL.createObjectURL(file)}
                alt={`صورة ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {i === 0 && (
                <div className="absolute bottom-1 right-1 bg-[#1877F2] text-white text-xs px-1.5 py-0.5 rounded-full">
                  رئيسية
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
