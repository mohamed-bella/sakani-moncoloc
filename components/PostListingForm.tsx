'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { ListingSchema, type ListingFormData } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { CITIES } from '@/types'
import imageCompression from 'browser-image-compression'
import ImageUploader from '@/components/ImageUploader'

interface PostListingFormProps {
  onSuccess?: () => void
}

export default function PostListingForm({ onSuccess }: PostListingFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [step, setStep] = useState(1)
  const totalSteps = 4

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(ListingSchema),
    defaultValues: {
      type: 'room_available',
      city: 'Agadir',
      gender_preference: 'any',
    },
  })

  const listingType = watch('type')

  const nextStep = async () => {
    let isValid = false
    if (step === 1) isValid = await trigger(['type'])
    else if (step === 2) isValid = await trigger(['city', 'neighborhood'])
    else if (step === 3) isValid = await trigger(['price', 'gender_preference'])
    
    if (isValid && step < totalSteps) {
      setStep(s => s + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('يجب تسجيل الدخول لنشر إعلان')

      const uploadedUrls: string[] = []
      
      if (photos.length > 0) {
        const listingId = uuidv4()
        
        // Compression Options
        const options = {
          maxSizeMB: 1,           // Max size 1MB
          maxWidthOrHeight: 1920, // Max width/height 1920px
          useWebWorker: true,
          initialQuality: 0.8     // High quality compression
        }

        for (const file of photos) {
          // Compress image
          const compressedBlob = await imageCompression(file, options)
          
          const ext = 'webp' // Convert to WEBP for better performance
          const fileName = `${uuidv4()}.${ext}`
          const filePath = `${user.id}/${listingId}/${fileName}`
          
          const { error: uploadError } = await supabase.storage
            .from('listing-photos')
            .upload(filePath, compressedBlob, {
              contentType: 'image/webp',
              upsert: true
            })
            
          if (uploadError) throw new Error('فشل في رفع الصور')
          
          const { data: { publicUrl } } = supabase.storage
            .from('listing-photos')
            .getPublicUrl(filePath)
            
          uploadedUrls.push(publicUrl)
        }
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Progress Bar Header */}
      <div className="px-6 py-4 border-b border-[#edeff1] sticky top-0 bg-white z-10 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs font-bold text-[#787C7E]">
          <span>الخطوة {step} من {totalSteps}</span>
          <span className="text-[#1c1c1c]">{
            step === 1 ? 'الغرض' : step === 2 ? 'الموقع' : step === 3 ? 'التفاصيل' : 'الوصف والصور'
          }</span>
        </div>
        <div className="h-1.5 w-full bg-[#f0f2f5] rounded-full overflow-hidden">
           <div className="h-full bg-[#0079D3] transition-all duration-300 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      {error && (
        <div className="bg-[#FFF0E5] text-[#FF4500] p-4 mx-6 mt-6 rounded font-bold border border-[#FF4500]/20 text-center text-sm shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex-grow flex flex-col px-6 py-6 pb-28 sm:pb-6 overflow-y-auto w-full max-w-lg mx-auto">
        
        {/* STEP 1: Type Selection */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-black text-[#1c1c1c] text-center mb-6">ما هو الغرض من الإعلان؟</h2>
            <div className="grid gap-4">
              <label className={`relative flex flex-col items-center justify-center p-6 cursor-pointer rounded-xl border-2 transition-all ${listingType === 'room_available' ? 'border-[#0079D3] bg-[#f0f7ff] text-[#0079D3] shadow-md scale-[1.02]' : 'border-[#edeff1] hover:border-[#0079D3]/50 text-[#787C7E]'}`}>
                <input type="radio" value="room_available" {...register('type')} className="sr-only" />
                <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span className="text-lg font-black">لدي غرفة للإيجار</span>
                <span className="text-xs text-center mt-2 opacity-80">أملك شقة أو غرفة وأبحث عن من يشاركني إياها</span>
              </label>

              <label className={`relative flex flex-col items-center justify-center p-6 cursor-pointer rounded-xl border-2 transition-all ${listingType === 'looking_for_roommate' ? 'border-[#0079D3] bg-[#f0f7ff] text-[#0079D3] shadow-md scale-[1.02]' : 'border-[#edeff1] hover:border-[#0079D3]/50 text-[#787C7E]'}`}>
                <input type="radio" value="looking_for_roommate" {...register('type')} className="sr-only" />
                <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span className="text-lg font-black">أبحث عن غرفة / شريك</span>
                <span className="text-xs text-center mt-2 opacity-80">أريد الانتقال وأبحث عن شخص لديه سكن أو يريد البحث معي</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <h2 className="text-xl font-black text-[#1c1c1c] text-center mb-6">أين يقع السكن؟</h2>
            <div>
              <label className="block text-sm font-bold text-[#1c1c1c] mb-2 text-right">المدينة <span className="text-[#FF4500]">*</span></label>
              <select {...register('city')} className="w-full px-4 py-3 bg-[#f6f7f8] border-2 border-[#edeff1] rounded-xl text-base focus:outline-none focus:border-[#0079D3] focus:bg-white cursor-pointer transition-colors appearance-none text-right font-medium" dir="rtl" disabled={isSubmitting}>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              {errors.city && <p className="text-[#FF4500] text-xs mt-1 text-right font-bold">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1c1c1c] mb-2 text-right">الحي (اختياري)</label>
              <input type="text" {...register('neighborhood')} className="w-full px-4 py-3 bg-[#f6f7f8] border-2 border-[#edeff1] rounded-xl text-base focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors text-right font-medium placeholder:text-[#878A8C]" dir="rtl" placeholder="مثال: حي المعاريف" disabled={isSubmitting} />
            </div>
          </div>
        )}

        {/* STEP 3: Details */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
            <h2 className="text-xl font-black text-[#1c1c1c] text-center mb-6">التفاصيل والأشخاص</h2>
            
            <div>
              <label className="block text-sm font-bold text-[#1c1c1c] mb-2 text-right">السعر المطلوب (درهم/شهر) <span className="text-[#FF4500]">*</span></label>
              <div className="relative">
                <input type="number" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-4 bg-[#f6f7f8] border-2 border-[#edeff1] rounded-xl text-lg font-black focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors text-center" dir="rtl" placeholder="0" disabled={isSubmitting} />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#787C7E] font-bold">د.م</span>
              </div>
              {errors.price && <p className="text-[#FF4500] text-xs mt-2 text-center font-bold">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1c1c] mb-3 text-right">من تفضل كشريك سكن؟ <span className="text-[#FF4500]">*</span></label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'any', label: 'الجميع', icon: 'للكل' },
                  { value: 'male', label: 'ذكور', icon: '👦' },
                  { value: 'female', label: 'إناث', icon: '👩' }
                ].map((opt) => (
                   <label key={opt.value} className={`relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-xl border-2 transition-all ${watch('gender_preference') === opt.value ? 'border-[#0079D3] bg-[#f0f7ff] text-[#0079D3] font-black shadow-md scale-105' : 'border-[#edeff1] text-[#787C7E] hover:border-[#0079D3]/30 hover:bg-[#f6f7f8]'}`}>
                     <input type="radio" value={opt.value} {...register('gender_preference')} className="sr-only" />
                     <span className="text-2xl mb-2">{opt.icon}</span>
                     <span className="text-xs font-bold">{opt.label}</span>
                   </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Story & Photos */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
            <h2 className="text-xl font-black text-[#1c1c1c] text-center mb-6">أخبرنا المزيد التخيل</h2>

            <div>
              <label className="block text-sm font-bold text-[#1c1c1c] mb-2 text-right">عنوان الإعلان <span className="text-[#FF4500]">*</span></label>
              <input type="text" {...register('title')} className="w-full px-4 py-3 bg-[#f6f7f8] border-2 border-[#edeff1] rounded-xl text-sm font-medium focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors text-right" dir="rtl" placeholder="مثال: غرفة مشمسة للطلاب في حي أكدال" disabled={isSubmitting} />
              {errors.title && <p className="text-[#FF4500] text-xs mt-1 text-right font-bold">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1c1c1c] mb-2 text-right">وصف تفصيلي <span className="text-[#FF4500]">*</span></label>
              <textarea {...register('description')} rows={4} className="w-full px-4 py-3 bg-[#f6f7f8] border-2 border-[#edeff1] rounded-xl text-sm font-medium focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors resize-none text-right placeholder:leading-relaxed" dir="rtl" placeholder={`عن ماذا تبحث؟ ما هي الميزات؟\n- التجهيزات\n- نمط الحياة المفضل\n- أي تفاصيل إضافية...`} disabled={isSubmitting} />
              {errors.description && <p className="text-[#FF4500] text-xs mt-1 text-right font-bold">{errors.description.message}</p>}
            </div>

            {listingType === 'room_available' && (
              <div>
                <label className="block text-sm font-bold text-[#1c1c1c] mb-2 text-right">الصور (اختياري، لكن ينصح بها)</label>
                <div className="bg-[#f6f7f8] p-4 rounded-xl border-2 border-dashed border-[#ccc] transition-colors focus-within:border-[#0079D3] focus-within:bg-[#f0f7ff]">
                   <ImageUploader files={photos} onChange={setPhotos} maxFiles={5} />
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-[#787C7E] text-center mt-4 leading-relaxed bg-[#f6f7f8] p-3 rounded font-medium">
              بمجرد النشر، أنت توافق على شروط سياسة المحتوى الخاصة بسكني. نوصي بتجنب نشر أرقام الهواتف أو معلومات التواصل في الوصف للأمان.
            </p>
          </div>
        )}

        {/* Floating Navigation Footer */}
        <div className="fixed sm:sticky bottom-0 left-0 right-0 p-4 sm:p-0 sm:pt-6 bg-white sm:bg-transparent border-t border-[#edeff1] sm:border-t-0 mt-auto flex gap-3 z-20 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] sm:shadow-none">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="px-6 py-3.5 bg-white border-2 border-[#edeff1] text-[#1c1c1c] font-black rounded text-base hover:bg-[#f6f7f8] transition-colors">
              رجوع
            </button>
          )}
          {step < totalSteps ? (
            <button type="button" onClick={nextStep} className="flex-grow btn-primary py-3.5 text-base shadow-sm">
              التالي
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="flex-grow btn-primary py-3.5 text-base shadow-sm">
              {isSubmitting ? 'جاري النشر...' : 'أضف الإعلان الآن'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
