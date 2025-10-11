// @ts-ignore
import { notFound } from 'next/navigation';
import { createNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'zh'];

export async function getMessages(locale: string) {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export const { Link, redirect, usePathname, useRouter } = createNavigation({ locales });

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locale ?? 'en';
  return {
    locale: safeLocale,
    messages: await getMessages(safeLocale)
  }
});
