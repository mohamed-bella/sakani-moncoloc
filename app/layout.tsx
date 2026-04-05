import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'moncoloc.ma - شبكة السكن المشترك',
    template: '%s | moncoloc.ma',
  },
  description: 'المنصة المغربية الأولى المخصصة للسكن المشترك والبحث عن شركاء سكن بكل شفافية.',
  icons: {
    icon: '/logo_moncoloc.ma.png',
    shortcut: '/logo_moncoloc.ma.png',
    apple: '/logo_moncoloc.ma.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="antialiased min-h-screen flex flex-col" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
        
        {/* Sticky Header - Navbar handles its own positioning */}
        <Navbar />


        {/* Main Content Area */}
        <main className="flex-grow pb-[80px] md:pb-0">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </body>
    </html>
  )
}
