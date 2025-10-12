import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://learn-assistant.aries-happy.com'; // Remove trailing slash
  const locales = ['en', 'zh']; // Assuming these locales based on messages files

  const pages = locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: 0.8,
  } as const));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 1,
    } as const,
    ...pages,
  ];
}
