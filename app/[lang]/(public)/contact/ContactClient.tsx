'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, FileText, MapPin } from 'lucide-react';
import ContactButton from '@/components/shared/ContactButton';

interface ContactClientProps {
  locale: string;
}

export default function ContactClient({ locale }: ContactClientProps) {
  const router = useRouter();

  // 📍 페이지 로드시 자동으로 contact 모달 파라미터 추가
  useEffect(() => {
    // 현재 URL에 ?contact=true가 없다면 추가
    if (!window.location.search.includes('contact=true')) {
      router.replace(`/${locale}/contact?contact=true`, { scroll: false });
    }
  }, [router, locale]);

  // 다국어 텍스트
  const texts = {
    ko: {
      // 히어로 섹션
      heroTitle: 'Contact Informations',
      heroDescription: '견적문의부터 일반적인 질문까지 브릿지메이커스의 전문 서비스에 대해 문의하세요.',
      contactUsBtn: 'CONTACT US',
      
      // 연락처 정보
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      location: 'Location',
      
      noJsMessage: 'JavaScript가 비활성화되어 있습니다. 위의 연락처 정보를 이용하여 직접 연락해주세요.'
    },
    en: {
      // 히어로 섹션
      heroTitle: 'Contact Informations',
      heroDescription: 'Get in touch with Bridgemakers for professional services.\nWe welcome all inquiries from quotes to general questions.',
      contactUsBtn: 'CONTACT US',
      
      // 연락처 정보
      phoneNumber: 'Phone Number',
      emailAddress: 'Email Address',
      location: 'Location',
      
      noJsMessage: 'JavaScript is disabled. Please use the contact information above to reach us directly.'
    }
  };

  const t = texts[locale as keyof typeof texts] || texts.ko;

  return (
    <div className="min-h-screen bg-black">
      {/* 히어로 섹션 */}
      <div className="relative bg-black py-20 px-4 overflow-hidden">
        {/* 금색 뭉개구름 애니메이션 효과 */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="golden-cloud-1 absolute opacity-10"></div>
          <div className="golden-cloud-2 absolute opacity-5"></div>
          <div className="golden-cloud-3 absolute opacity-8"></div>
          <div className="golden-cloud-4 absolute opacity-5"></div>
          <div className="center-glow"></div>
          <div className="light-beam-horizontal"></div>
          <div className="light-beam-vertical"></div>
          <div className="golden-orb"></div>
        </div>

        {/* 히어로 컨텐츠 */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* 별표 아이콘 */}
          <div className="flex justify-center mb-8">
            <svg width="24" height="24" viewBox="0 0 24 24" className="text-white" fill="currentColor">
              <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
            </svg>
          </div>
          
          <h1 className="text-[28px] md:text-[32px] font-semibold text-white mb-6 tracking-[0.5px] leading-[1.2]">
            {t.heroTitle}
          </h1>
          <p className="text-[#C7C7CC] text-[16px] mb-12 max-w-2xl mx-auto leading-[1.5] tracking-[0px] whitespace-pre-line">
            {t.heroDescription}
          </p>
          
          {/* Contact Us 버튼 */}
          <ContactButton 
            variant="primary" 
            size="lg" 
            text={t.contactUsBtn}
            className="button-primary inline-flex items-center justify-center py-3 px-6 rounded-lg hover:bg-[#b99a58] transform hover:translate-y-[-2px] transition-all duration-300 text-[14px] tracking-[0px] font-medium"
          />
        </div>
      </div>

      {/* 메인 컨텐츠 섹션 */}
      <div className="py-20 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          {/* 연락처 정보 */}
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Phone Number */}
            <div className="flex items-start space-x-4 p-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#cba967]/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#cba967] to-[#b99a58] rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-[20px] md:text-[24px] font-semibold text-white mb-3 tracking-[0.5px] leading-[1.3]">{t.phoneNumber}</h3>
                <p className="text-[#C7C7CC] text-[14px] leading-[1.5] mb-1">+82 10 4254 0711 (South Korea)</p>
                <p className="text-[#C7C7CC] text-[14px] leading-[1.5]">+49 176 2497 7603 (Germany)</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start space-x-4 p-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#cba967]/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#cba967] to-[#b99a58] rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-[20px] md:text-[24px] font-semibold text-white mb-3 tracking-[0.5px] leading-[1.3]">{t.emailAddress}</h3>
                <p className="text-[#C7C7CC] text-[14px] leading-[1.5]">doobeom@ibridgemakers.de</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start space-x-4 p-6 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] hover:border-[#cba967]/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#cba967] to-[#b99a58] rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-[20px] md:text-[24px] font-semibold text-white mb-3 tracking-[0.5px] leading-[1.3]">{t.location}</h3>
                <p className="text-[#C7C7CC] text-[14px] leading-[1.5] mb-1">전북특별자치도 장수군 계북면 토옥동로 267-26 (South Korea)</p>
                <p className="text-[#C7C7CC] text-[14px] leading-[1.5]">Rahmannstrasse 11, 65760 Eschborn (Germany)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JavaScript 비활성화시 대체 컨텐츠 */}
      <noscript>
        <div className="bg-[#2a2a2a] border-t border-[#3a3a3a] p-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-[#C7C7CC] text-center text-[14px] leading-[1.5]">
              {t.noJsMessage}
            </p>
          </div>
        </div>
      </noscript>
    </div>
  );
} 