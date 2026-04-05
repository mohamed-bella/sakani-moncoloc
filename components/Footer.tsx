import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#edeff1] py-8 mt-12">
      <div className="max-w-[1000px] mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 no-underline text-[#1c1c1c] hover:opacity-80">
              <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma" className="w-8 h-8 object-contain" />
              <span className="text-sm font-bold tracking-tight">moncoloc.ma</span>
            </Link>
            <span className="text-[10px] text-[#878A8C] font-bold uppercase tracking-widest mt-1">
              &copy; {new Date().getFullYear()} - صنع بكل حب
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-[#787C7E]">
            <Link href="/about" className="hover:text-[#0079D3] transition-colors uppercase tracking-tight">من نحن</Link>
            <Link href="/privacy" className="hover:text-[#0079D3] transition-colors uppercase tracking-tight">سياسة الخصوصية</Link>
            <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer" className="hover:text-[#0079D3] transition-colors uppercase tracking-tight">تواصل معنا</a>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-[#f6f7f8] text-[10px] text-[#878A8C] text-center leading-relaxed font-medium">
          هذا المشروع تم تطويره بمبادرة من طلاب واجهوا صعوبة حقيقية في إيجاد سكن مشترك. يهدف moncoloc.ma لتبسيط عملية البحث عن شركاء سكن في المغرب بكل شفافية وأمان. جميع الحقوق محفوظة لـ moncoloc.ma.
        </div>
      </div>
    </footer>
  )
}
