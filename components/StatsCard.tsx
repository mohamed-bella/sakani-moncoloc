interface StatsCardProps {
  viewCount: number
  whatsappClickCount: number
}

export default function StatsCard({ viewCount, whatsappClickCount }: StatsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Views */}
      <div className="bg-[#f6f7f8] border border-[#edeff1] rounded p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[#787C7E] mb-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">مشاهدات</span>
        </div>
        <p className="text-xl font-bold text-[#1c1c1c] leading-none mt-1">{viewCount.toLocaleString('ar-MA')}</p>
      </div>

      {/* WhatsApp clicks */}
      <div className="bg-[#f6f7f8] border border-[#edeff1] rounded p-3 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[#0079D3] mb-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.534 5.853L.073 23.447a.5.5 0 00.607.607l5.594-1.461A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.789-.527-5.36-1.446l-.383-.225-3.977 1.039 1.038-3.978-.228-.392A9.967 9.967 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">نقرات واتساب</span>
        </div>
        <p className="text-xl font-bold text-[#0079D3] leading-none mt-1">{whatsappClickCount.toLocaleString('ar-MA')}</p>
      </div>
    </div>
  )
}
