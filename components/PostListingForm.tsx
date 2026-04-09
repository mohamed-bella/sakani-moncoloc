'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { ListingSchema, type ListingFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { CITIES, LIFESTYLE_TAGS } from '@/types'
import imageCompression from 'browser-image-compression'
import ImageUploader from '@/components/ImageUploader'

interface PostListingFormProps {
  onSuccess?: () => void
  /** When true the component manages its own height (inside modal) */
  inModal?: boolean
}

const TOTAL_STEPS = 4

// ─── Step indicators ─────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 px-6 pt-4 pb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full transition-all duration-400"
          style={{
            background: i < current ? '#0071E3' : 'rgba(60,60,67,0.12)',
          }}
        />
      ))}
    </div>
  )
}

export default function PostListingForm({ onSuccess, inModal = false }: PostListingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      type: 'room_available',
      city: 'Casablanca',
      gender_preference: 'any',
      tags: [],
    },
  })

  const listingType = watch('type')
  const selectedCity = watch('city')
  const selectedGender = watch('gender_preference')
  const selectedTags = watch('tags') || []

  const descriptionValue = watch('description') || ''
  const isDescriptionValid = descriptionValue.length >= 20

  useEffect(() => {
    async function loadUserWhatsapp() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('whatsapp').eq('id', user.id).single()
        if (data?.whatsapp) setValue('whatsapp_number', data.whatsapp)
      }
    }
    loadUserWhatsapp()
  }, [supabase, setValue])

  const goNext = async () => {
    // Validate fields for the current step before advancing
    let valid = true
    if (step === 2) {
      valid = await trigger(['city', 'price', 'whatsapp_number'])
    } else if (step === 4) {
      valid = await trigger(['description'])
    }
    if (!valid) return
    setDirection('forward')
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = () => {
    setDirection('back')
    setStep(s => Math.max(s - 1, 1))
  }

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uploadedUrls: string[] = []

      if (photos.length > 0) {
        const listingId = uuidv4()
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, initialQuality: 0.8 }
        for (const file of photos) {
          const compressed = await imageCompression(file, options)
          const filePath = `${user ? user.id : 'guest_uploads'}/${listingId}/${uuidv4()}.webp`
          const { error: uploadError } = await supabase.storage.from('listing-photos').upload(filePath, compressed, { contentType: 'image/webp', upsert: true })
          if (uploadError) throw new Error('فشل في رفع الصور')
          const { data: { publicUrl } } = supabase.storage.from('listing-photos').getPublicUrl(filePath)
          uploadedUrls.push(publicUrl)
        }
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          title: data.title || data.description.substring(0, 50).trim() + (data.description.length > 50 ? '...' : ''),
          photos: uploadedUrls,
        }),
      })

      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || 'فشل في نشر الإعلان')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
      setStep(4) // send back to last step to show error
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Step labels ─────────────────────────────────────────────────────────
  const stepLabel = (
    <span>
      {['نوع الإعلان', 'الموقع والسعر', 'التفضيلات', 'الوصف والصور'][step - 1]}
      {step === 1 && <span className="text-[#FF3B30] mr-1">*</span>}
    </span>
  )

  // ─── Wrapper height strategy ──────────────────────────────────────────────
  const wrapperClass = inModal
    ? 'flex flex-col h-full'
    : 'flex flex-col min-h-[520px]'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={wrapperClass}>

      {/* ── Progress bar ── */}
      <StepBar current={step} total={TOTAL_STEPS} />

      {/* ── Step counter + label ── */}
      <div className="px-6 pb-4 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#8E8E93] mb-0.5">
            الخطوة {step} من {TOTAL_STEPS}
          </p>
          <h2 className="text-[1.35rem] font-bold text-[#1C1C1E] tracking-tight">{stepLabel}</h2>
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">

        {/* ════ STEP 1 — TYPE ════ */}
        {step === 1 && (
          <div className="flex flex-col gap-4 pt-1">
            {[
              {
                value: 'room_available',
                emoji: '🏠',
                title: 'لدي غرفة أو شقة',
                sub: 'أملك مكاناً وأبحث عن شريك يقاسمني السكن.',
              },
              {
                value: 'looking_for_roommate',
                emoji: '🔍',
                title: 'أبحث عن غرفة أو شريك',
                sub: 'أريد الانتقال وأبحث عن سكن أو شخص يريد البحث معي.',
              },
            ].map(opt => (
              <label
                key={opt.value}
                className={`relative flex items-start gap-5 p-5 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                  listingType === opt.value
                    ? 'border-[#0071E3] bg-[#EAF2FF]'
                    : 'border-[rgba(60,60,67,0.12)] bg-white hover:border-[rgba(60,60,67,0.25)]'
                }`}
              >
                <input type="radio" value={opt.value} {...register('type')} className="sr-only" />
                <span className="text-3xl mt-0.5 flex-shrink-0">{opt.emoji}</span>
                <div className="flex-1">
                  <p className={`text-base font-semibold mb-1 leading-tight ${listingType === opt.value ? 'text-[#0071E3]' : 'text-[#1C1C1E]'}`}>
                    {opt.title}
                  </p>
                  <p className="text-sm text-[#8E8E93] leading-snug">{opt.sub}</p>
                </div>
                {/* Check indicator */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  listingType === opt.value ? 'border-[#0071E3] bg-[#0071E3]' : 'border-[rgba(60,60,67,0.2)] bg-white'
                }`}>
                  {listingType === opt.value && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        {/* ════ STEP 2 — LOCATION + PRICE + WHATSAPP ════ */}
        {step === 2 && (
          <div className="flex flex-col gap-5 pt-1">

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                المدينة <span className="text-[#FF3B30]">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('city')}
                  dir="rtl"
                  className="w-full appearance-none bg-[#F2F2F7] border-2 border-transparent rounded-xl px-4 py-3.5 text-[#1C1C1E] font-medium text-sm focus:outline-none focus:border-[#0071E3] focus:bg-white transition-all cursor-pointer"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-2">الحي <span className="text-[#8E8E93] font-normal">(اختياري)</span></label>
              <input
                type="text"
                {...register('neighborhood')}
                dir="rtl"
                placeholder="مثال: المعاريف، أكدال..."
                className="w-full bg-[#F2F2F7] border-2 border-transparent rounded-xl px-4 py-3.5 text-sm font-medium text-[#1C1C1E] placeholder:text-[#AEAEB2] focus:outline-none focus:border-[#0071E3] focus:bg-white transition-all"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                السعر الشهري <span className="text-[#FF3B30]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="2500"
                  className="w-full bg-[#F2F2F7] border-2 border-transparent rounded-xl px-4 py-3.5 text-[1.1rem] font-semibold text-[#1C1C1E] text-center placeholder:text-[#AEAEB2] focus:outline-none focus:border-[#0071E3] focus:bg-white transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8E8E93]">د.م</span>
              </div>
              {errors.price && <p className="text-[#FF3B30] text-xs mt-1.5 font-medium">{errors.price.message}</p>}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
                رقم الواتساب للتواصل <span className="text-[#FF3B30]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  {...register('whatsapp_number')}
                  dir="ltr"
                  placeholder="0612345678"
                  className="w-full bg-[#F2F2F7] border-2 border-transparent rounded-xl px-4 py-3.5 text-sm font-medium text-[#1C1C1E] placeholder:text-[#AEAEB2] focus:outline-none focus:border-[#0071E3] focus:bg-white transition-all"
                />
              </div>
              {errors.whatsapp_number && <p className="text-[#FF3B30] text-xs mt-1.5 font-medium">{errors.whatsapp_number.message}</p>}
            </div>

          </div>
        )}

        {/* ════ STEP 3 — PREFERENCES ════ */}
        {step === 3 && (
          <div className="flex flex-col gap-6 pt-1">

            {/* Gender preference */}
            <div>
              <p className="text-sm font-medium text-[#1C1C1E] mb-3">تفضيل الجنس</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'any', label: 'الجميع', icon: '🤝' },
                  { value: 'male', label: 'ذكور', icon: '👦' },
                  { value: 'female', label: 'إناث', icon: '👩' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 cursor-pointer transition-all select-none ${
                      selectedGender === opt.value
                        ? 'border-[#0071E3] bg-[#EAF2FF]'
                        : 'border-[rgba(60,60,67,0.12)] bg-white hover:border-[rgba(60,60,67,0.25)]'
                    }`}
                  >
                    <input type="radio" value={opt.value} {...register('gender_preference')} className="sr-only" />
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`text-xs font-semibold ${selectedGender === opt.value ? 'text-[#0071E3]' : 'text-[#1C1C1E]'}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lifestyle tags */}
            <div>
              <p className="text-sm font-medium text-[#1C1C1E] mb-1">نمط الحياة</p>
              <p className="text-xs text-[#8E8E93] mb-3">اختر ما يصف وضعك وما تبحث عنه</p>
              <div className="flex flex-wrap gap-2" dir="rtl">
                {LIFESTYLE_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <label
                      key={tag}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border cursor-pointer transition-all text-sm select-none ${
                        isSelected
                          ? 'border-[#0071E3] bg-[#0071E3] text-white'
                          : 'border-[rgba(60,60,67,0.12)] bg-white text-[#1C1C1E] hover:border-[rgba(60,60,67,0.3)]'
                      }`}
                    >
                      <input type="checkbox" value={tag} {...register('tags')} className="sr-only" />
                      <span className="font-medium">{tag}</span>
                    </label>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* ════ STEP 4 — DESCRIPTION + PHOTOS ════ */}
        {step === 4 && (
          <div className="flex flex-col gap-5 pt-1">

            {/* Error banner */}
            {error && (
              <div className="bg-[#FFF0EE] border border-[#FF3B30]/20 text-[#FF3B30] rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-medium text-[#1C1C1E]">
                  الوصف التفصيلي <span className="text-[#FF3B30]">*</span>
                </label>
                <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                  isDescriptionValid ? 'bg-[#EAF2FF] text-[#0071E3]' : 'bg-[#F2F2F7] text-[#8E8E93]'
                }`}>
                  {descriptionValue.length} / 20 حرف كحد أدنى
                </div>
              </div>
              <textarea
                {...register('description')}
                dir="rtl"
                rows={5}
                placeholder={`صف ما تقدمه أو ما تبحث عنه...\n- تجهيزات السكن\n- نمط الحياة المفضل\n- تفاصيل أخرى`}
                className="w-full bg-[#F2F2F7] border-2 border-transparent rounded-xl px-4 py-3.5 text-sm font-medium text-[#1C1C1E] placeholder:text-[#AEAEB2] placeholder:leading-relaxed focus:outline-none focus:border-[#0071E3] focus:bg-white transition-all resize-none leading-relaxed"
              />
              {errors.description && <p className="text-[#FF3B30] text-xs mt-1.5 font-medium">{errors.description.message}</p>}
            </div>

            {/* Photos — only for room_available */}
            {listingType === 'room_available' && (
              <div>
                <label className="block text-sm font-medium text-[#1C1C1E] mb-1">الصور</label>
                <p className="text-xs text-[#8E8E93] mb-3">اختياري — الإعلانات بصور تحصل على 3× اهتمام أكثر</p>
                <div className="bg-[#F2F2F7] rounded-2xl p-3 border-2 border-dashed border-[rgba(60,60,67,0.15)]">
                  <ImageUploader files={photos} onChange={setPhotos} maxFiles={5} />
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-[#AEAEB2] text-center leading-relaxed">
              بالنشر أنت توافق على سياسة المحتوى الخاصة بـ moncoloc.ma
            </p>
          </div>
        )}

      </div>
      {/* ── end content ── */}

      {/* ── Navigation footer ── */}
      <div className="px-6 py-4 border-t border-[rgba(60,60,67,0.08)] flex items-center gap-3 bg-white">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="w-11 h-11 rounded-full border-2 border-[rgba(60,60,67,0.15)] flex items-center justify-center text-[#1C1C1E] hover:border-[#0071E3] hover:text-[#0071E3] transition-all flex-shrink-0 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div className="w-11 flex-shrink-0" />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="flex-1 bg-[#0071E3] hover:bg-[#0058b0] text-white font-semibold text-sm py-3 rounded-full transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(0,113,227,0.30)]"
          >
            التالي
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#0071E3] hover:bg-[#0058b0] disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-full transition-all active:scale-[0.98] shadow-[0_4px_14px_rgba(0,113,227,0.30)] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري النشر...</span>
              </>
            ) : (
              'نشر الإعلان'
            )}
          </button>
        )}
      </div>

    </form>
  )
}
