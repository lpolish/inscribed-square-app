import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('content')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('techStack')}
          </p>
        </div>
      </div>
    </footer>
  )
}

