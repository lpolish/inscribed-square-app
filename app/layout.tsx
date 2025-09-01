import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "Enhanced Inscribed Square Finder",
  openGraph: {
    images: [
      {
        url: "/ogg.png",
        width: 800,
        height: 600,
        alt: "Enhanced Inscribed Square Finder"
      }
    ]
  }
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

