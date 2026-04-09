'use client'

import PostListingForm from '@/components/PostListingForm'
import { useRouter } from 'next/navigation'

export default function PostListingPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    /* Full-viewport canvas — the wizard lives here */
    <div className="min-h-[calc(100vh-48px)] bg-[#F2F2F7] flex flex-col items-center justify-start py-6 px-4">

      {/* Constrained card */}
      <div className="w-full max-w-[540px] bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        <PostListingForm onSuccess={handleSuccess} />
      </div>

      {/* Fine print below the card */}
      <p className="text-[11px] text-[#AEAEB2] text-center mt-6 max-w-xs leading-relaxed">
        جميع الإعلانات مجانية. moncoloc.ma لا تتقاضى أي عمولة على الصفقات.
      </p>
    </div>
  )
}
