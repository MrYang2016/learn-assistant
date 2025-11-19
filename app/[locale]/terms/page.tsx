import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  const tCommon = await getTranslations({ locale });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">{tCommon('appName')}</h1>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t('lastUpdated')}: {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
        </p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section1.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section1.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section2.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t('section2.intro')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t('section2.item1')}</li>
              <li>{t('section2.item2')}</li>
              <li>{t('section2.item3')}</li>
              <li>{t('section2.item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section3.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section3.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section4.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section4.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section5.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section5.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section6.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section6.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section7.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section7.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section8.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section8.content')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('section9.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('section9.content')}</p>
          </section>
        </div>
      </main>
    </div>
  );
}

