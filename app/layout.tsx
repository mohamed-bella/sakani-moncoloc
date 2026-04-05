import type { Metadata } from 'next'
import { Tajawal } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BrandingLogger from '@/components/BrandingLogger'

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
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NETESGSMP4"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-NETESGSMP4');
`
          }}
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T8JP6L9T');`
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T8JP6L9T"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <BrandingLogger />
        
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
