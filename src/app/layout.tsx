import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'Systemato | سیستماتو',
  description: 'مدیریت رزرو و مشتری برای کسب‌وکارهای محلی',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Systemato' },
  icons: { apple: '/icons/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#0FB9B1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.variable}>
      <body style={{ fontFamily: 'var(--font-vazirmatn), Vazirmatn, sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
