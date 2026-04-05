import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'قصتنا وفلسفتنا',
  description: 'كيف بدأ مشروع moncoloc.ma من صلب معاناة الطلاب في إيجاد سكن مشترك.',
}

export default function AboutPage(props: {
  params: Promise<any>
  searchParams: Promise<any>
}) {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-12">
      <div className="card-widget p-8 sm:p-12">
        
        {/* Header Section */}
        <div className="text-center mb-12 border-b border-[#edeff1] pb-8">
           <div className="w-16 h-16 rounded-full bg-[#FF4500] flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src="/logo_moncoloc.ma.png" alt="moncoloc.ma Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-[#1c1c1c] uppercase tracking-wide">عن "moncoloc.ma" وفلسفتنا</h1>
          <p className="text-[#787C7E] text-sm mt-2 font-bold tracking-tight">مشروع ولد من صلب المعاناة اليومية للطالب المغربي</p>
        </div>

        <section className="space-y-10">
          
          {/* The Story */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#FF4500] uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-4 bg-[#FF4500]" />
               قصتنا
            </h2>
            <p className="text-[#1c1c1c] leading-relaxed text-sm">
              بدأت فكرة "moncoloc.ma" في أروقة الكليات، حيث عشنا جميعاً تلك اللحظة العصيبة: تجد ميزانيتك محدودة، والبحث عن غرفة للإيجار في مدينة غريبة يشبه محاولة العثور على إبرة في كومة قش. واجهنا كطلاب صعوبة حقيقية في إيجاد شركاء سكن يشاركوننا نفس الاهتمامات أو "الجو الدراسي".
            </p>
            <p className="text-[#1c1c1c] leading-relaxed text-sm">
              بين سماسرة يطلبون مبالغ خيالية، وبين إعلانات مضللة على منصات غير متخصصة، قررنا نحن مجموعة من الطلاب المطورين أن نكف عن التذمر ونبدأ في الحل. moncoloc.ma هو ثمرة هذا التحدي.
            </p>
          </div>

          {/* Philosophy */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#0079D3] uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-4 bg-[#0079D3]" />
               فلسفتنا
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
               <div className="bg-[#f6f7f8] p-4 rounded border border-[#edeff1]">
                  <h3 className="font-bold text-sm text-[#1c1c1c] mb-2">الشفافية الكاملة</h3>
                  <p className="text-[10px] text-[#787C7E] leading-relaxed">لا يوجد سماسرة أو عمولات خفية. التواصل مباشر تماماً بين صاحب الإعلان والباحث عن السكن.</p>
               </div>
               <div className="bg-[#f6f7f8] p-4 rounded border border-[#edeff1]">
                  <h3 className="font-bold text-sm text-[#1c1c1c] mb-2">للطلاب، من الطلاب</h3>
                  <p className="text-[10px] text-[#787C7E] leading-relaxed">نحن نفهم تفاصيل حياتك: من مواعيد الامتحانات إلى الحاجة للهدوء، منصتنا مصممة لخدمة نمط حياتك.</p>
               </div>
               <div className="bg-[#f6f7f8] p-4 rounded border border-[#edeff1]">
                  <h3 className="font-bold text-sm text-[#1c1c1c] mb-2">الأمان أولاً</h3>
                  <p className="text-[10px] text-[#787C7E] leading-relaxed">نظامنا يقلل من فرص السبام والاحتيال عبر قوانين نشر صارمة وتقنيات تحقق متقدمة.</p>
               </div>
               <div className="bg-[#f6f7f8] p-4 rounded border border-[#edeff1]">
                  <h3 className="font-bold text-sm text-[#1c1c1c] mb-2">البساطة الوظيفية</h3>
                  <p className="text-[10px] text-[#787C7E] leading-relaxed">نحن نؤمن بالتصميم الذي لا يشتتك. معلومات واضحة، فلاتر حقيقية، وطريق مباشر للتواصل.</p>
               </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-[#f6f7f8] p-6 rounded-md text-center border border-[#edeff1] border-dashed mt-8">
             <h3 className="text-sm font-bold text-[#1c1c1c] mb-2">هل تبحث عن رفيق سكن؟</h3>
             <p className="text-xs text-[#787C7E] mb-6">انضم لعائلتنا المتنامية وساهم في جعل تجربة السكن الجامعي أفضل للجميع.</p>
             <button className="btn-primary py-2 px-8 shadow-sm">تصفح الإعلانات الآن</button>
          </div>
        </section>
      </div>
    </div>
  )
}
