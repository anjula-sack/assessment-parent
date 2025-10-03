'use client'
import { Fredoka } from 'next/font/google'
import './globals.css'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import React, { useEffect } from 'react'
import '@/i18n'
import { useTranslation } from 'react-i18next'

const fredoka = Fredoka({ subsets: ['latin-ext'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <html lang="en" dir="ltr">
      <body
        className={`${fredoka.className} bg-primary-100 tracking-wide`}
        tabIndex={-1}
      >
        <title>Tilli</title>
        <main className="min-h-screen">
          <section
            className="min-h-screen relative"
            style={{
              backgroundImage: `url('/bg.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {children}
          </section>
        </main>
      </body>
    </html>
  )
}
