'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { locales, defaultLocale } from '@/config';

interface LocaleValidatorProps {
  children: React.ReactNode;
  locale: string;
}

const LocaleValidator: React.FC<LocaleValidatorProps> = ({ children, locale }) => {
  const router = useRouter();

  useEffect(() => {
    if (!locales.includes(locale as any)) {
      router.replace(`/${defaultLocale}`);
    }
  }, [locale, router]);

  return <>{children}</>;
};

export default LocaleValidator;

