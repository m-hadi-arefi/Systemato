'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { RealtimeProvider } from '@/context/RealtimeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Vazirmatn, sans-serif',
              direction: 'rtl',
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  )
}
