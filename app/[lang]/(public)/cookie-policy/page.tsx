import { Metadata } from 'next'
import { validateLocale, getTranslations } from '@/lib/i18n'
import DocumentTemplate from '@/components/templates/DocumentTemplate'

interface PageProps {
  params: { lang: string }
}

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const locale = validateLocale(lang)
  const t = getTranslations(locale, 'legal')
  
  return {
    title: `${t.cookiePolicy?.title || 'Cookie Policy'} | BRIDGEMAKERS`,
    description: locale === 'ko' 
      ? '브릿지메이커스의 쿠키 정책을 확인하세요. 쿠키 사용 목적, 유형, 관리 방법에 대한 상세한 정보를 제공합니다.'
      : 'Check Bridgemakers\' cookie policy. We provide detailed information about cookie usage purposes, types, and management methods.',
  }
}

export default function CookiePolicyPage({ params: { lang } }: PageProps) {
  return <DocumentTemplate lang={lang} documentType="cookiePolicy" />
} 