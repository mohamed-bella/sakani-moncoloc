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

  const {
    register,
    handleSubmit,
    watch,
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
    <div className="p-6">
      {error && (
        <div className="bg-[#FFF0E5] text-[#FF4500] p-4 rounded text-sm mb-6 font-bold border border-[#edeff1] text-right">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#787C7E] uppercase mb-3 tracking-wider text-right">ما هو الغرض من الإعلان؟</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative flex items-center justify-center p-3 cursor-pointer rounded border transition-all ${listingType === 'room_available' ? 'border-[#0079D3] bg-[#f0f7ff] text-[#0079D3] font-bold ring-1 ring-[#0079D3]' : 'border-[#ccc] hover:border-[#0079D3]/50 text-[#787C7E]'}`}>
              <input type="radio" value="room_available" {...register('type')} className="sr-only" />
              <span className="text-sm">لدي غرفة للإيجار</span>
            </label>
            <label className={`relative flex items-center justify-center p-3 cursor-pointer rounded border transition-all ${listingType === 'looking_for_roommate' ? 'border-[#0079D3] bg-[#f0f7ff] text-[#0079D3] font-bold ring-1 ring-[#0079D3]' : 'border-[#ccc] hover:border-[#0079D3]/50 text-[#787C7E]'}`}>
              <input type="radio" value="looking_for_roommate" {...register('type')} className="sr-only" />
              <span className="text-sm">أبحث عن غرفة / شريك</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5 uppercase tracking-tight text-right">عنوان الإعلان</label>
          <input type="text" {...register('title')} className="w-full px-4 py-2.5 bg-[#f6f7f8] border border-[#edeff1] rounded text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors text-right" dir="rtl" placeholder="مثال: غرفة مشمسة للطلاب في حي أكدال" disabled={isSubmitting} />
          {errors.title && <p className="text-red-500 text-xs mt-1 text-right">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5 uppercase tracking-tight text-right">المدينة</label>
            <select {...register('city')} className="w-full px-4 py-2.5 bg-[#f6f7f8] border border-[#edeff1] rounded text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white cursor-pointer transition-colors appearance-none text-right" dir="rtl" disabled={isSubmitting}>
              {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5 uppercase tracking-tight text-right">الحي (اختياري)</label>
            <input type="text" {...register('neighborhood')} className="w-full px-4 py-2.5 bg-[#f6f7f8] border border-[#edeff1] rounded text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors text-right" dir="rtl" placeholder="مثال: حي المعاريف" disabled={isSubmitting} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5 uppercase tracking-tight text-right">السعر المطلول (درهم/شهر)</label>
            <input type="number" {...register('price', { valueAsNumber: true })} className="w-full px-4 py-2.5 bg-[#f6f7f8] border border-[#edeff1] rounded text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors text-right" dir="rtl" placeholder="مثال: 1500" disabled={isSubmitting} />
            {errors.price && <p className="text-red-500 text-xs mt-1 text-right">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5 uppercase tracking-tight text-right">من تفضل كشريك سكن؟</label>
            <select {...register('gender_preference')} className="w-full px-4 py-2.5 bg-[#f6f7f8] border border-[#edeff1] rounded text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white cursor-pointer transition-colors appearance-none text-right" dir="rtl" disabled={isSubmitting}>
              <option value="any">لا يهم (الجميع)</option>
              <option value="male">ذكور فقط</option>
              <option value="female">إناث فقط</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1c1c1c] mb-1.5 uppercase tracking-tight text-right">وصف تفصيلي</label>
          <textarea {...register('description')} rows={5} className="w-full px-4 py-2.5 bg-[#f6f7f8] border border-[#edeff1] rounded text-sm focus:outline-none focus:border-[#0079D3] focus:bg-white transition-colors resize-none text-right" dir="rtl" placeholder={`اخبرنا المزيد حول...\n- ميزات الغرفة / الشقة\n- التجهيزات المتوفرة\n- نمط الحياة المفضل`} disabled={isSubmitting} />
          {errors.description && <p className="text-red-500 text-xs mt-1 text-right">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#787C7E] mb-3 uppercase tracking-wider text-right">الصور (اختياري)</label>
          <div className="bg-[#f6f7f8] p-4 rounded border border-dashed border-[#ccc]">
             <ImageUploader files={photos} onChange={setPhotos} maxFiles={5} />
          </div>
        </div>

        <div className="pt-4">
           <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3 text-base shadow-sm">
             {isSubmitting ? 'جاري النشر...' : 'أضف الإعلان الآن'}
           </button>
           <p className="text-[10px] text-[#787C7E] text-center mt-3 leading-relaxed">
             بمجرد النشر، أنت توافق على شروط سياسة المحتوى الخاصة بسكني. نوصي بتجنب نشر أرقام الهواتف أو معلومات التواصل في الوصف - استخدم خانة التواصل المباشر.
           </p>
        </div>
      </form>
    </div>
  )
}
