import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatPrice, listingTypeLabel } from '@/lib/utils'
import StatsCard from '@/components/StatsCard'
import DashboardListingActions from './DashboardListingActions'

export default async function DashboardPage(props: {
  params: Promise<any>
  searchParams: Promise<any>
}) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's listings
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*, locked_by_admin')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 py-12 text-center">
        <div className="card-widget p-8 text-red-500 font-bold">
           حدث خطأ أثناء جلب إعلاناتك. الرجاء المحاولة مرة أخرى لاحقاً.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1c1c1c]">لوحة التحكم الخاصة بك</h1>
          <p className="text-[#787C7E] text-sm mt-1">إدارة إحصائياتك وإعلاناتك النشطة</p>
        </div>
        <Link
          href="/post"
          className="btn-accent px-6 py-2"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          أضف إعلانك
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="card-widget p-12 text-center bg-white">
          <div className="w-16 h-16 bg-[#f6f7f8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#787C7E]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#1c1c1c] mb-2">لم تنشر أي إعلان بعد</h2>
          <p className="text-[#787C7E] text-sm mb-6">شارك إعلانك الأول للوصول لآلاف الباحثين عن سكن</p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/post"
              className="btn-primary w-full sm:w-auto"
            >
              أضف إعلانك الأول
            </Link>
            <Link href="/" className="text-[#0079D3] text-sm font-black hover:underline tracking-tight">
              تصفح جميع الإعلانات المتوفرة
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <div key={listing.id} className={`card-widget bg-white overflow-hidden relative group transition-all border ${
              listing.locked_by_admin ? 'border-red-200 shadow-lg shadow-red-50' : 'border-[#edeff1]'
            }`}>
              {listing.locked_by_admin && (
                <div className="bg-[#FF4500] text-white py-2.5 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-wider">تم إيقاف هذا الإعلان بواسطة الإدارة</span>
                  </div>
                  <span className="text-[10px] font-bold opacity-80">DESACTIVATED</span>
                </div>
              )}
              <div className="p-5 flex flex-col md:flex-row gap-6">
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-lg text-[#1c1c1c] line-clamp-1 leading-tight">
                      {listing.title}
                    </h3>
                    <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                      listing.status === 'active' ? 'bg-[#e7f3ff] text-[#0079D3]' : 'bg-[#f6f7f8] text-[#787C7E]'
                    }`}>
                      {listing.status === 'active' ? 'نشط' : 'مغلق'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#787C7E] mb-2 font-bold">
                    <span className="flex items-center gap-1.5 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ccc]" />
                      {listingTypeLabel(listing.type)}
                    </span>
                    <span className="flex items-center gap-1.5 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ccc]" />
                      {listing.city}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#0079D3] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0079D3]/20" />
                      {formatPrice(listing.price)}
                    </span>
                  </div>

                  {/* Actions */}
                  <DashboardListingActions 
                    listingId={listing.id} 
                    currentStatus={listing.status} 
                    isLocked={listing.locked_by_admin}
                  />
                </div>

                {/* Stats Widget */}
                <div className="w-full md:w-56 flex-shrink-0 border-t md:border-t-0 md:border-r border-[#edeff1] pt-4 md:pt-0 md:pr-4">
                  <StatsCard viewCount={listing.view_count} whatsappClickCount={listing.whatsapp_click_count} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
