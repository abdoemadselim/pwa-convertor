import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import Footer from "./components/Footer"
import { GoogleAnalytics } from '@next/third-parties/google'
import { FlickeringGridBackground } from "./components/FlickeringGridBackground"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PWAify - Modern Website to PWA Converter",
  description: "Transform any website into a Progressive Web App with just a few clicks",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon512x512.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon512x512.png" />
      </head>
      <GoogleAnalytics gaId="G-8ME0273M9M" />
      <body
        className={`${inter.className} bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-gray-100 min-h-screen`}
      >
        <FlickeringGridBackground />
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative z-10">{children}</div>
        <Toaster />
        <Footer />
      </body>
    </html>
  )
}

