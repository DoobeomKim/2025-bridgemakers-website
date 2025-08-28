import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ibridgemakers.de';
  
  // 기본 페이지들
  const routes = [
    '',
    '/about',
    '/services', 
    '/work',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy'
  ];
  
  const sitemap: MetadataRoute.Sitemap = [];
  
  // 각 언어별로 URL 생성
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8
      });
    });
  });
  
  return sitemap;
}
