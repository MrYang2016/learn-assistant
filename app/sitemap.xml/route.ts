// app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

export async function GET() {
  const baseUrl = 'https://learn-assistant.aries-happy.com';
  const locales = ['en', 'zh'];

  const smStream = new SitemapStream({
    hostname: baseUrl,
  });

  // Your links array (good addition!)
  const links = [
    { lang: 'x-default', url: baseUrl },
    { lang: 'en', url: `${baseUrl}/en` },
    { lang: 'zh', url: `${baseUrl}/zh` },
  ];

  // Root URL
  smStream.write({
    url: '/',
    lastmod: new Date().toISOString(),
    changefreq: 'yearly',
    priority: 1,
    links,
  });

  // Locale pages
  locales.forEach((locale) => {
    smStream.write({
      url: `/${locale}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
      links,
    });
  });

  smStream.end();

  const xmlBuffer = await streamToPromise(smStream);
  const xml = xmlBuffer.toString().replace(/\n\s+/g, ''); // Minimize: Remove newlines and indentation

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline; filename="sitemap.xml"',
    },
  });
}
