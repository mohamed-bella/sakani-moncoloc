'use client'

import PostListingForm from '@/components/PostListingForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PostListingPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-8">
      {/* Go Back Link */}
       <div className="mb-4">
        <Link 
          href="/"
          className="flex items-center gap-2 text-[#787C7E] hover:text-[#1c1c1c] text-sm font-bold transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة للرئيسية
        </Link>
      </div>

      <div className="card-widget overflow-hidden">
        <div className="bg-white border-b border-[#edeff1] p-6 sm:p-8">
          <h1 className="text-2xl font-black text-[#1c1c1c]">أضف إعلانك الجديد</h1>
          <p className="text-[#787C7E] text-sm mt-1">املاً البيانات التالية لنشر غرفتك أو طلبك لشريك سكن</p>
        </div>
        
        <div className="bg-white">
          <PostListingForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
