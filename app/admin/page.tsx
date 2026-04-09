'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────
interface Stats {
  totalListings: number
  activeListings: number
  closedListings: number
  totalUsers: number
  bannedUsers: number
  pendingReports: number
  totalReports: number
}

interface Report {
  id: string
  listing_id: string
  category: string
  details: string
  status: string
  created_at: string
  listings: { id: string; title: string; city: string; status: string; user_id: string } | null
}

interface AdminListing {
  id: string
  type: string
  title: string
  city: string
  price: number
  status: string
  locked_by_admin: boolean
  created_at: string
  user_id: string
  profiles: { name: string; whatsapp: string; is_banned: boolean } | null
}

interface AdminUser {
  id: string
  name: string
  whatsapp: string
  is_admin: boolean
  is_banned: boolean
  ban_reason: string | null
  created_at: string
  listing_count: number
}

type Tab = 'overview' | 'reports' | 'listings' | 'users'

const CATEGORY_LABELS: Record<string, string> = {
  fake: 'إعلان مزيف',
  harassment: 'تحرش',
  already_rented: 'مؤجرة مسبقاً',
  other: 'أخرى',
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, color, svgPath }: {
  label: string; value: number | string; color: string; svgPath: string
}) {
  const bgColor = color === 'text-green-600' ? 'bg-green-50' : 
                 color === 'text-blue-600' ? 'bg-blue-50' :
                 color === 'text-red-600' ? 'bg-red-50' : 'bg-orange-50';
  
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
        <div className={`text-3xl font-black ${color}`}>{value}</div>
      </div>
      <div className={`p-3 rounded-2xl ${bgColor}`}>
        <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={svgPath}></path>
        </svg>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [listings, setListings] = useState<AdminListing[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listingFilter, setListingFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [banReason, setBanReason] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState<Record<string, boolean>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // ─── Fetch helpers ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setStats(data.stats)
  }, [])

  const fetchReports = useCallback(async () => {
    const res = await fetch('/api/admin/reports')
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setReports(data.reports)
  }, [])

  const fetchListings = useCallback(async () => {
    const res = await fetch(`/api/admin/listings?status=${listingFilter}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setListings(data.listings)
  }, [listingFilter])

  const fetchUsers = useCallback(async () => {
    const res = await fetch(`/api/admin/users${userSearch ? `?q=${encodeURIComponent(userSearch)}` : ''}`)
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUsers(data.users)
  }, [userSearch])

  useEffect(() => {
    setError(null)
    setLoading(true)
    const load = async () => {
      try {
        if (activeTab === 'overview') await Promise.all([fetchStats(), fetchReports()])
        else if (activeTab === 'reports') await fetchReports()
        else if (activeTab === 'listings') await fetchListings()
        else if (activeTab === 'users') await fetchUsers()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeTab, fetchStats, fetchReports, fetchListings, fetchUsers])

  const reportAction = async (reportId: string, listingId: string | null, action: string) => {
    setActionSubmitting(prev => ({ ...prev, [reportId]: true }))
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, listingId, action }),
    })
    setActionSubmitting(prev => ({ ...prev, [reportId]: false }))
    if (!res.ok) { alert('فشل الإجراء'); return }
    await fetchReports()
    await fetchStats()
  }

  const listingAction = async (listingId: string, action: string) => {
    if (action === 'delete' && confirmDelete !== listingId) {
      setConfirmDelete(listingId); return
    }
    setConfirmDelete(null)
    setActionSubmitting(prev => ({ ...prev, [listingId]: true }))
    const res = await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, action }),
    })
    setActionSubmitting(prev => ({ ...prev, [listingId]: false }))
    if (!res.ok) { alert('فشل الإجراء'); return }
    await fetchListings()
    await fetchStats()
  }

  const userAction = async (userId: string, action: string, reason?: string) => {
    setActionSubmitting(prev => ({ ...prev, [userId]: true }))
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, reason }),
    })
    setActionSubmitting(prev => ({ ...prev, [userId]: false }))
    if (!res.ok) { alert('فشل الإجراء'); return }
    await fetchUsers()
    await fetchStats()
    setBanReason('')
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-20">
      
      {/* Header Profile Info */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 mb-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900 tracking-tight">لوحة الإدارة</h1>
          <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">سكني - نظام المشرفين v2</div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6">

        {/* Tab Navigation (Professional Light Design) */}
        <div className="flex items-center gap-1 mb-8 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit overflow-hidden">
          {(['overview', 'reports', 'listings', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' && 'نظرة عامة'}
              {tab === 'reports' && 'البلاغات'}
              {tab === 'listings' && 'الإعلانات'}
              {tab === 'users' && 'المستخدمون'}
              {tab === 'reports' && stats?.pendingReports ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'reports' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
                  {stats.pendingReports}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
             <span className="font-bold">تنبيه:</span> {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-sm font-medium">جاري تحديث البيانات...</div>
          </div>
        )}

        {/* ─── OVERVIEW TAB ─── */}
        {!loading && activeTab === 'overview' && stats && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="إعلانات قيد العقود" value={stats.activeListings} color="text-green-600" svgPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              <StatCard label="إجمالي المسجلين" value={stats.totalUsers} color="text-blue-600" svgPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              <StatCard label="بلاغات تحتاج مراجعة" value={stats.pendingReports} color="text-red-600" svgPath="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              <StatCard label="حسابات محظورة" value={stats.bannedUsers} color="text-orange-600" svgPath="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reports Preview Card */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-900">البلاغات المعلقة</h2>
                  <Link href="#" onClick={() => setActiveTab('reports')} className="text-blue-600 text-xs font-bold hover:underline">عرض المزيد</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {reports.filter(r => r.status === 'pending').slice(0, 5).map(report => (
                    <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded">{CATEGORY_LABELS[report.category] || report.category}</span>
                        <div className="text-sm font-bold text-gray-900 mt-1">{report.listings?.title || 'إعلان محذوف'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => reportAction(report.id, report.listing_id, 'close_listing')} 
                          disabled={actionSubmitting[report.id]}
                          className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {actionSubmitting[report.id] && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                          إغلاق
                        </button>
                        <button 
                          onClick={() => reportAction(report.id, report.listing_id, 'dismiss')} 
                          disabled={actionSubmitting[report.id]}
                          className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-200 disabled:opacity-50"
                        >
                          تجاهل
                        </button>
                      </div>
                    </div>
                  ))}
                  {reports.filter(r => r.status === 'pending').length === 0 && (
                     <div className="p-12 text-center text-gray-400 text-sm italic">لا توجد بلاغات حالياً</div>
                  )}
                </div>
              </div>

               {/* Recent Stats Summary */}
               <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h2 className="font-black text-gray-900 mb-6">ملخص النظام</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm font-bold">إجمالي الإعلانات</span>
                        <span className="text-gray-900 font-black">{stats.totalListings}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full">
                        <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${(stats.activeListings / stats.totalListings) * 100}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm font-bold">نسبة البلاغات / الإعلانات</span>
                        <span className="text-gray-900 font-black">{Math.round((stats.totalReports / stats.totalListings) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-50 text-xs text-gray-400 text-center font-bold">
                    تم التحديث منذ لحظات
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ─── REPORTS TAB ─── */}
        {!loading && activeTab === 'reports' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
            {reports.map(report => (
              <div key={report.id} className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start ${report.status !== 'pending' && 'opacity-60 grayscale'}`}>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase text-white bg-gray-900 px-3 py-1 rounded-full">{CATEGORY_LABELS[report.category] || report.category}</span>
                    <span className="text-gray-400 text-xs font-bold">{formatDate(report.created_at)}</span>
                  </div>
                  <h3 className="text-gray-900 font-black text-lg mb-2">
                    {report.listings ? (
                      <Link href={`/listing/${report.listing_id}`} target="_blank" className="hover:text-blue-600 underline decoration-blue-200 decoration-4 underline-offset-4">{report.listings.title}</Link>
                    ) : 'المقال محذوف بالفعل'}
                  </h3>
                  {report.details && (
                    <p className="bg-gray-50 border border-gray-100 p-4 rounded-xl text-gray-600 text-sm italic leading-relaxed">"{report.details}"</p>
                  )}
                </div>
                {report.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0 md:w-48">
                    <button 
                      onClick={() => reportAction(report.id, report.listing_id, 'close_listing')} 
                      disabled={actionSubmitting[report.id]}
                      className="bg-red-600 text-white font-black py-3 rounded-xl shadow-lg shadow-red-200 hover:scale-[1.02] transition-transform cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionSubmitting[report.id] && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      إغلاق المقال فورا
                    </button>
                    <button 
                      onClick={() => reportAction(report.id, report.listing_id, 'dismiss')} 
                      disabled={actionSubmitting[report.id]}
                      className="bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer disabled:opacity-50"
                    >
                      تجاهل البلاغ
                    </button>
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && <div className="text-center py-20 text-gray-400 font-bold">لا توجد بلاغات متاحة</div>}
          </div>
        )}

        {/* ─── LISTINGS TAB ─── */}
        {!loading && activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              {(['all', 'active', 'pending', 'closed'] as const).map(f => (
                <button key={f} onClick={() => setListingFilter(f)} className={`px-5 py-2 text-xs font-bold rounded-full transition-all border ${listingFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                  {f === 'all' ? 'جميع المناطق' : f === 'active' ? 'النشطة' : f === 'pending' ? 'بانتظار الموافقة' : 'المؤرشفة'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map(listing => (
                <div key={listing.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition-all hover:border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${listing.status === 'active' ? 'bg-green-500' : listing.status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{listing.city} — {listing.price} MAD</span>
                    </div>
                    {listing.locked_by_admin && (
                       <span className="text-[10px] font-black py-1 px-3 bg-red-600 text-white rounded-full">مقفل إدارياً</span>
                    )}
                  </div>
                  <h4 className="text-gray-900 font-bold mb-3 line-clamp-1">{listing.title}</h4>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="text-xs font-bold text-gray-500">من: {listing.profiles?.name || 'غير معروف'}</div>
                    <div className="flex gap-1.5">
                      {listing.status === 'pending' && (
                        <button 
                          onClick={() => listingAction(listing.id, 'approve')} 
                          disabled={actionSubmitting[listing.id]}
                          className="text-[10px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {actionSubmitting[listing.id] && <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                          موافقة
                        </button>
                      )}
                      {listing.status === 'active' ? (
                        <button 
                          onClick={() => listingAction(listing.id, 'close')} 
                          disabled={actionSubmitting[listing.id]}
                          className="text-[10px] font-black text-white bg-orange-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {actionSubmitting[listing.id] && <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                          إغلاق
                        </button>
                      ) : (
                        listing.status !== 'pending' && (
                          <button 
                            onClick={() => listingAction(listing.id, 'reopen')} 
                            disabled={actionSubmitting[listing.id]}
                            className="text-[10px] font-black text-white bg-green-600 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {actionSubmitting[listing.id] && <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            تنشيط
                          </button>
                        )
                      )}
                      <button 
                        onClick={() => listingAction(listing.id, 'delete')} 
                        disabled={actionSubmitting[listing.id]}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 ${confirmDelete === listing.id ? 'bg-red-600 text-white ring-4 ring-red-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                      >
                        {confirmDelete === listing.id ? 'تأكيد الحذف' : 'حذف نهائي'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── USERS TAB ─── */}
        {!loading && activeTab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-black text-gray-900 text-lg">الأعضاء والمشتركون</h2>
              <div className="relative">
                <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="ابحث بالاسم أو الواتساب..." className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-right pr-4" dir="rtl" />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
               {users.map(user => (
                 <div key={user.id} className="p-6 flex flex-col md:flex-row items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-lg">{user.name.charAt(0)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                           <span className="text-gray-900 font-black text-base">{user.name}</span>
                           {user.is_admin && <span className="blue-600 text-[10px] font-black bg-blue-50 px-2 py-0.5 rounded">مشرف</span>}
                           {user.is_banned && <span className="text-red-600 text-[10px] font-black bg-red-50 px-2 py-0.5 rounded">محظور</span>}
                        </div>
                        <div className="text-xs font-bold text-gray-400 mt-0.5">{user.whatsapp} — {user.listing_count} إعلانات</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto justify-end">
                       {!user.is_banned ? (
                         <div className="flex items-center gap-2">
                           <input type="text" placeholder="السبب..." value={banReason} onChange={e => setBanReason(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-40" dir="rtl" />
                           <button 
                            onClick={() => userAction(user.id, 'ban', banReason || 'انتهاك قوانين المنصة')} 
                            disabled={actionSubmitting[user.id]}
                            className="bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl cursor-pointer hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                           >
                            {actionSubmitting[user.id] && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            حظر
                           </button>
                         </div>
                       ) : (
                         <button 
                          onClick={() => userAction(user.id, 'unban')} 
                          disabled={actionSubmitting[user.id]}
                          className="bg-green-600 text-white text-xs font-black px-6 py-2 rounded-xl cursor-pointer hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                         >
                          {actionSubmitting[user.id] && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                          رفع الحظر
                         </button>
                       )}
                       <button 
                        onClick={() => userAction(user.id, user.is_admin ? 'demote' : 'promote')} 
                        disabled={actionSubmitting[user.id]}
                        className="bg-white border border-gray-200 text-gray-600 text-xs font-black px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
                       >
                         {user.is_admin ? 'عضو عادي' : 'ترقية لمشرف'}
                       </button>
                    </div>
                 </div>
               ))}
               {users.length === 0 && <div className="p-12 text-center text-gray-400">لا توجد نتائج مطابقة لبحثك</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
