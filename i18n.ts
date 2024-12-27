import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './config';

export default getRequestConfig(async ({locale}) => {
  // Instead of calling notFound(), we'll use the defaultLocale
  const safeLocale = locales.includes(locale as any) ? locale : defaultLocale;

  return {
    messages: (await import(`./messages/${safeLocale}.json`)).default
  };
});

