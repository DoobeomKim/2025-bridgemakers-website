import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ibridgemakers.de';
  
  // 기본 페이지들 (우선순위별)
  const routes = [
    { path: '', priority: 1.0, changeFreq: 'daily' },
    { path: '/about', priority: 0.9, changeFreq: 'weekly' },
    { path: '/services', priority: 0.8, changeFreq: 'weekly' },
    { path: '/work', priority: 0.8, changeFreq: 'weekly' },
    { path: '/contact', priority: 0.7, changeFreq: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changeFreq: 'yearly' },
    { path: '/terms-of-service', priority: 0.3, changeFreq: 'yearly' },
    { path: '/cookie-policy', priority: 0.3, changeFreq: 'yearly' }
  ];
  
  const sitemap: MetadataRoute.Sitemap = [];
  
  // 각 언어별로 URL 생성
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFreq as any,
        priority: route.priority
      });
    });
  });
  
  return sitemap;
}
