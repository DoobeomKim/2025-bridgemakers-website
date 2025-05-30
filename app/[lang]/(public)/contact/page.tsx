import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: '서비스 문의 | 브릿지메이커스',
  description: '브릿지메이커스의 전문 서비스에 대해 문의해보세요. 견적문의부터 일반적인 질문까지 모든 문의를 환영합니다.',
  keywords: ['브릿지메이커스', '문의', '견적', '서비스', '웹개발', '영상제작', 'SNS컨텐츠'],
  openGraph: {
    title: '서비스 문의 | 브릿지메이커스',
    description: '브릿지메이커스의 전문 서비스에 대해 문의해보세요.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function ContactPage({ 
  params 
}: { 
  params: { lang: string } 
}) {
  return <ContactClient locale={params.lang} />;
}