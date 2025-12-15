import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ShopHeader } from "@/components/shop-header"

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "GameCMS.su - Магазин модулей",
  description: "Магазин премиум модулей для GameCMS",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`dark ${fontSans.variable}`}>
      <body className="antialiased">
        <div className="min-h-screen bg-background px-4 py-6">
          <div className="mx-auto max-w-[1280px] space-y-6">
            <ShopHeader />
            {children}
            <footer className="p-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground/60">
                <p>gamecms.su © 2025</p>
                <a href="/documents" className="hover:text-muted-foreground transition-colors">
                  Документы
                </a>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
}
