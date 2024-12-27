import { MetadataRoute } from 'next'
import { locales, defaultLocale } from '@/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://squares.luispulido.com'

  const routes = locales.map((locale) => ({
    url: locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: locale === defaultLocale ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          l === defaultLocale ? baseUrl : `${baseUrl}/${l}`
        ])
      ),
    },
  }))

  return routes
}

