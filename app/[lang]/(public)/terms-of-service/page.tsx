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
    title: `${t.terms?.title || 'Terms of Service'} | BRIDGEMAKERS`,
    description: locale === 'ko' 
      ? '브릿지메이커스의 서비스 이용약관을 확인하세요. 서비스 이용 조건, 사용자 의무, 회사의 권리와 책임에 대한 정보를 제공합니다.'
      : 'Check Bridgemakers\' terms of service. We provide information about service usage conditions, user obligations, and company rights and responsibilities.',
  }
}

export default function TermsOfServicePage({ params: { lang } }: PageProps) {
  return <DocumentTemplate lang={lang} documentType="terms" />
} 