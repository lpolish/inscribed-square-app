import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getTranslator } from 'next-intl/server'
import { ThemeProvider } from "@/components/theme-provider"
import "../globals.css"
import LocaleValidator from "@/components/LocalValidator"

const inter = Inter({ subsets: ["latin"] })

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslator(params.locale, 'Metadata')

  return {
    title: t('title'),
    description: t('description'),
    icons: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
    ],
    manifest: '/manifest.json',
  }
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }, { locale: 'ja' }, { locale: 'ko' }, { locale: 'zh' }, { locale: 'fr' }, { locale: 'de' }, { locale: 'it' }, { locale: 'pt' }, { locale: 'ru' }, { locale: 'uk' }, { locale: 'hi' }, { locale: 'nl' }, { locale: 'tr' }]
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <LocaleValidator locale={locale}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </LocaleValidator>
      </body>
    </html>
  )
}

