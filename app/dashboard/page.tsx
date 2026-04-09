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
    redirect('/')
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
              {listing.status === 'pending' && (
                <div className="bg-[#FFF9E6] text-[#856404] py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ffeeba]">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#e6ac00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider mb-0.5">بانتظار موافقة الإدارة</p>
                      <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                        سيتم نشر إعلانك فور مراجعته من قبل المشرفين للتأكد من جودته ومنع السبام.
                      </p>
                    </div>
                  </div>
                  <a 
                    href={`https://wa.me/212704969534?text=${encodeURIComponent(`مرحباً، لقد قمت بنشر إعلان بعنوان "${listing.title}" وأرغب في تفعيله بسرعة.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-white hover:bg-yellow-100 text-[#856404] px-4 py-2 rounded-xl text-[10px] font-black border border-[#ffeeba] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    تفعيل سريع
                  </a>
                </div>
              )}
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
                      listing.status === 'active' ? 'bg-[#e7f3ff] text-[#0079D3]' : 
                      listing.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                      'bg-[#f6f7f8] text-[#787C7E]'
                    }`}>
                      {listing.status === 'active' ? 'نشط' : listing.status === 'pending' ? 'بانتظار الموافقة' : 'مغلق'}
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
                    bumpedAt={listing.bumped_at}
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
