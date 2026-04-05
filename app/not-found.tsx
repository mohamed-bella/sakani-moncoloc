import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 bg-[#E9EDEF] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-12 h-12 text-[#65676B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-[#050505] mb-2">404 - الصفحة غير موجودة</h1>
      <p className="text-[#65676B] text-lg mb-8 max-w-md">
        يبدو أنك ضللت الطريق. الصفحة التي تبحث عنها غير موجودة أو تم حذفها.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-[#1877F2] text-white rounded-xl font-bold hover:bg-[#166FE5] transition-colors shadow-sm"
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}
