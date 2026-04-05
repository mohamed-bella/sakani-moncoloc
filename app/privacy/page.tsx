import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'التزاماتنا بحماية خصوصية بيانات مستخدمي منصة moncoloc.ma.',
}

export default function PrivacyPage(props: {
  params: Promise<any>
  searchParams: Promise<any>
}) {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-12">
      <div className="card-widget p-8 sm:p-12">
        
        {/* Header Section */}
        <div className="text-center mb-12 border-b border-[#edeff1] pb-8">
           <div className="w-16 h-16 rounded-full bg-[#0079D3] flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-black text-[#1c1c1c] uppercase tracking-wide">سياسة الخصوصية</h1>
          <p className="text-[#787C7E] text-sm mt-2 font-bold tracking-tight">نحن نحترم بياناتك بقدر ما نحترم رغبتك في الخصوصية الشخصية.</p>
        </div>

        <section className="space-y-12">
          
          {/* Data Usage */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#1c1c1c] uppercase tracking-widest flex items-center gap-2 underline underline-offset-8 decoration-[#0079D3] decoration-2">
               01. ما هي البيانات التي نجمعها؟
            </h2>
            <p className="text-[#1c1c1c] leading-relaxed text-sm">
              نقوم بجمع الحد الأدنى من المعلومات الضرورية لتسهيل عملية التواصل بينك وبين شركاء السكن المحتملين: الاسم، ورقم الواتساب فقط. نحن لا نطلب أو نخزن أي سجلات جنائية، أو بيانات مصرفية، أو معلومات حساسة أخرى.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#1c1c1c] uppercase tracking-widest flex items-center gap-2 underline underline-offset-8 decoration-[#0079D3] decoration-2">
               02. كيف نحمي بياناتك؟
            </h2>
            <p className="text-[#1c1c1c] leading-relaxed text-sm">
              جميع معلوماتك الشخصية محمية بواسطة نظام Row Level Security (RLS) من شركة Supabase. هذا يعني أنه تقنياً، لا يمكن لأي شخص آخر تعديل أو حذف بياناتك أو إعلاناتك. كما نقوم بتنفيذ نظام تحقق يضمن أن كل إعلان مرتبط برقم هاتف فريد وحقيقي.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#1c1c1c] uppercase tracking-widest flex items-center gap-2 underline underline-offset-8 decoration-[#0079D3] decoration-2">
               03. مشاركة البيانات مع أطراف خارجية
            </h2>
            <p className="text-[#1c1c1c] leading-relaxed text-sm">
              نحن لا نبيع أو نؤجر أو نتاجر ببياناتك مع أي شركة إعلانية. بياناتك تستخدم فقط داخل منصة "moncoloc.ma" لغرض البحث عن سكن. الطرف الوحيد الذي ستتم مشاركة رقم الواتساب الخاص بك معه هو المستخدم الذي يقرر التواصل معك بجدية عبر الضغط على رابط الواتساب في إعلانك.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black text-[#1c1c1c] uppercase tracking-widest flex items-center gap-2 underline underline-offset-8 decoration-[#0079D3] decoration-2">
               04. حقوقك كصاحب بيانات
            </h2>
            <p className="text-[#1c1c1c] leading-relaxed text-sm">
              لديك كامل الصلاحية لحذف أي إعلان أو حذف حسابك بالكامل من لوحة التحكم في أي وقت. بمجرد قيامك بالحذف، يتم مسح بياناتك نهائياً من سيرفراتنا بشكل فوري.
            </p>
          </div>

           {/* Contact Info Footer */}
           <div className="mt-12 py-6 border-t border-[#edeff1] text-center italic text-[#878A8C] text-[10px]">
              إذا كانت لديك أي استفسارات قانونية، يمكنك التواصل معنا مباشرة كفريق تطوير طلابي عبر البريد الإلكتروني أو الواتساب الموضح في تذييل موقع moncoloc.ma.
           </div>
        </section>
      </div>
    </div>
  )
}
