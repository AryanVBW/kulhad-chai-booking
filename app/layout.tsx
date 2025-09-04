import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ToastProvider } from "@/components/toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kulhad Chai - Restaurant Management",
  description: "QR code ordering system for Kulhad Chai restaurant",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ToastProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
