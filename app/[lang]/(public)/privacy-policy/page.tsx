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
    title: `${t.privacy?.title || 'Privacy Policy'} | BRIDGEMAKERS`,
    description: locale === 'ko' 
      ? '브릿지메이커스의 개인정보 처리방침을 확인하세요. 개인정보 수집, 이용, 보관, 제3자 제공 등에 대한 상세한 정보를 제공합니다.'
      : 'Check Bridgemakers\' privacy policy. We provide detailed information about personal information collection, use, storage, and third-party provision.',
  }
}

export default function PrivacyPolicyPage({ params: { lang } }: PageProps) {
  return <DocumentTemplate lang={lang} documentType="privacy" />
} 