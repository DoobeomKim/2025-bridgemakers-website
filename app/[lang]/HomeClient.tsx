"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import InstagramFeed from "../../components/InstagramFeed";
import { useContactModal } from '@/hooks/useContactModal';

interface HomeClientProps {
  locale: string;
  projects: any[];
}

// Contact 모달 버튼을 위한 내부 컴포넌트
function ContactButton() {
  const { openModal } = useContactModal();
  
  return (
    <button 
      onClick={openModal}
      className="button-primary inline-flex items-center justify-between py-2.5 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-[#b99a58] transform hover:translate-y-[-2px] transition-all duration-300">
      <span className="font-medium text-[13px] sm:text-[14px] tracking-[0.25px]">상담하기</span>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

export default function HomeClient({ locale, projects }: HomeClientProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // 서비스 항목
  const services = [
    {
      id: 1,
      icon: "/icons/video-production.svg",
      title: "Video Production",
      description: "최고 품질의 비디오 제작 서비스를 제공합니다.",
      href: `/${locale}/services/video-production`
    },
    {
      id: 2,
      icon: "/icons/website-design.svg",
      title: "Website Design",
      description: "사용자 경험을 중심으로 한 웹사이트 디자인을 제공합니다.",
      href: `/${locale}/services/website-design`
    },
    {
      id: 3,
      icon: "/icons/brochure-design.svg",
      title: "Poster & Brochure Design",
      description: "인쇄 매체를 위한 효과적인 디자인 솔루션을 제공합니다.",
      href: `/${locale}/services/brochure-design`
    },
    {
      id: 4,
      icon: "/icons/marketing.svg",
      title: "Online Marketing",
      description: "디지털 마케팅을 통한 비즈니스 성장을 지원합니다.",
      href: `/${locale}/services/online-marketing`
    }
  ];

  // 프로젝트 데이터 매핑
  const formattedProjects = (projects || []).map(project => ({
    id: project.id,
    title: project.title,
    client: project.client,
    image: project.image_url,
    category: project.category,
    href: `/${locale}/work?project=${project.slug}`
  }));

  return (
    <>
      {/* 히어로 섹션 - 이미지와 함께 */}
      <div className="relative h-[75vh] sm:h-[80vh] md:h-[90vh] overflow-hidden bg-black">
        {/* 배경 이미지 제거하고 순수 검은 배경만 사용 */}
        
        {/* 금색 뭉개구름 애니메이션 효과 */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="golden-cloud-1 absolute opacity-20"></div>
          <div className="golden-cloud-2 absolute opacity-10"></div>
          <div className="golden-cloud-3 absolute opacity-15"></div>
          <div className="golden-cloud-4 absolute opacity-10"></div>
          <div className="center-glow"></div>
          <div className="light-beam-horizontal"></div>
          <div className="light-beam-vertical"></div>
          <div className="golden-orb"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row h-full">
          <div className="flex flex-col justify-center w-full md:w-2/3 py-4 sm:py-8 md:py-20">

            {/* 큰 텍스트 헤드라인 */}
            <div className="relative">
              {/* 별표 아이콘 - 데스크탑 */}
              <div className="hidden md:block absolute -left-10 top-3">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-white" fill="currentColor">
                  <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                </svg>
              </div>
              {/* 별표 아이콘 - 모바일 (중앙 상단에 배치) */}
              <div className="md:hidden flex justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" className="text-white" fill="currentColor">
                  <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                </svg>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-[0.5px] leading-[1.2] mb-5 sm:mb-8 md:mb-12 max-w-4xl pl-0">
                <span className="block mb-2 sm:mb-3 md:mb-5">당신의 비전을 실현할 시간</span>
                <span className="block sm:whitespace-nowrap md:text-4xl lg:text-5xl">지금, 필요한 디지털 컨텐츠를 만드세요</span>
              </h1>
            </div>
            
            {/* 설명 텍스트 */}
            <div className="pl-0 mb-6 sm:mb-10 md:mb-12">
              <p className="text-sm sm:text-base md:text-lg text-[#C7C7CC] max-w-2xl leading-[1.5] tracking-[0.25px] mb-2">
                영상 제작부터 웹사이트, 마케팅까지. 당신의 브랜드를 위한 디지털 솔루션을 제공합니다.
              </p>
              <p className="text-xs sm:text-sm md:text-base italic text-[#cba967] opacity-90 tracking-[0.5px]">
                Made in Europe, with Korean creativity.
              </p>
            </div>
            
            {/* CTA 버튼 */}
            <div className="pl-0">
              <Suspense fallback={
                <button 
                  className="button-primary inline-flex items-center justify-between py-2.5 sm:py-3 px-6 sm:px-8 rounded-full opacity-50 cursor-not-allowed"
                  disabled
                >
                  <span className="font-medium text-[13px] sm:text-[14px] tracking-[0.25px]">상담하기</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              }>
                <ContactButton />
              </Suspense>
            </div>
          </div>
          
          {/* 오른쪽 영역 - 데스크탑에서만 표시하되 내용 제거 */}
          <div className="hidden md:block w-1/3"></div>
        </div>
      </div>

      {/* 홍보 영상 섹션 */}
      <section className="py-12 sm:py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-medium text-white tracking-[0.5px] leading-[1.2] mb-2">See How We Can Help Your Brand</h2>
          </div>

          <div className="relative mx-auto max-w-4xl overflow-hidden">
            {/* 태블릿 테두리 효과를 위한 컨테이너 */}
            <div className="tablet-frame">
              {/* 영상 썸네일 및 플레이어 */}
              <div className="tablet-screen aspect-video">
                <div className="relative w-full h-full">
                  {!isVideoModalOpen ? (
                    <>
                      <img
                        src="/images/video-thumbnail.jpg"
                        alt="Bridge Makers Showreel"
                        className="absolute inset-0 w-full h-full object-cover rounded-[12px] sm:rounded-[18px] cursor-pointer"
                        loading="lazy"
                      />
                      
                      {/* 비디오 플레이 버튼 */}
                      <button 
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center group play-btn-container cursor-pointer" 
                        onClick={() => setIsVideoModalOpen(true)}
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 play-btn-pulse flex items-center justify-center enhanced-pulse">
                          <div className="w-0 h-0 border-t-[8px] sm:border-t-[10px] border-t-transparent border-b-[8px] sm:border-b-[10px] border-b-transparent border-l-[14px] sm:border-l-[18px] border-l-white ml-1"></div>
                        </div>
                        <span className="absolute bottom-4 sm:bottom-6 text-center play-btn-label text-xs sm:text-sm">Play Video</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/b7Tmt5fdzes?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1&showinfo=0&fs=0&color=white"
                        title="Video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute inset-0 pointer-events-none video-overlay"></div>
                      <button 
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                        onClick={() => setIsVideoModalOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 특징 섹션 - 영상 아래에 직접 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10 sm:mt-14 px-2 sm:px-4">
            {/* 특징 1 */}
            <div className="feature-card rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(203,169,103,0.1)] text-[#cba967] rounded-[16px] mb-3 sm:mb-4">
                  <img
                    src="/icons/icon_creative.svg"
                    alt="크리에이티브 전문가"
                    width={24}
                    height={24}
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">크리에이티브 전문가</h3>
                <p className="text-xs sm:text-sm text-[#C7C7CC] leading-relaxed">
                  웹디자인과 영상 제작에 특화된 팀이 직접 기획하고 제작합니다
                </p>
              </div>
            </div>

            {/* 특징 2 */}
            <div className="feature-card rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(203,169,103,0.1)] text-[#cba967] rounded-[16px] mb-3 sm:mb-4">
                  <img
                    src="/icons/icon_customized-strategy.svg"
                    alt="맞춤형 전략"
                    width={24}
                    height={24}
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">맞춤형 전략</h3>
                <p className="text-xs sm:text-sm text-[#C7C7CC] leading-relaxed">
                  디지털 콘텐츠가 낯선 기업도 걱정 없이! 단계별 계획과 타임테이블을 제공합니다
                </p>
              </div>
            </div>

            {/* 특징 3 */}
            <div className="feature-card rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[rgba(203,169,103,0.1)] text-[#cba967] rounded-[16px] mb-3 sm:mb-4">
                  <img
                    src="/icons/icon_global-content.svg"
                    alt="현지 맞춤 컨텐츠"
                    width={24}
                    height={24}
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">현지 맞춤 컨텐츠</h3>
                <p className="text-xs sm:text-sm text-[#C7C7CC] leading-relaxed">
                  언어와 문화를 반영해 유럽 시장에 딱 맞는 컨텐츠를 만듭니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 섹션 */}
      <section className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-white tracking-[0.5px] leading-[1.2]">프로젝트</h2>
            <div className="mt-2 w-16 sm:w-20 h-1 bg-[#cba967] mx-auto"></div>
            <p className="text-[#C7C7CC] text-sm sm:text-base max-w-2xl mx-auto mt-3 sm:mt-4">
              다양한 컨텐츠 제작 프로젝트와 클라이언트 성공 사례를 소개합니다
            </p>
          </div>

          {/* 프로젝트 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12">
            {formattedProjects.map((project) => (
              <Link
                key={project.id}
                href={project.href}
                className="rounded-xl sm:rounded-2xl overflow-hidden bg-[#050a16] border border-[rgba(203,169,103,0.2)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(203,169,103,0.15)] transform hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">{project.title}</h3>
                    <span className="text-[10px] sm:text-xs text-[#cba967] bg-[rgba(203,169,103,0.1)] px-2 sm:px-3 py-1 rounded-full">{project.category}</span>
                  </div>
                  <p className="text-[#C7C7CC] text-xs sm:text-sm">
                    {project.client}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <Link 
              href={`/${locale}/work`}
              className="inline-flex items-center justify-center py-2.5 sm:py-3 px-6 sm:px-8 rounded-full bg-transparent border border-[#cba967] text-[#cba967] hover:bg-[rgba(203,169,103,0.1)] transform hover:translate-y-[-2px] transition-all duration-300"
            >
              <span className="font-medium text-[12px] sm:text-[14px] tracking-[0.25px]">모든 프로젝트 보기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 인스타그램 피드 섹션 */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#050a16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-white tracking-[0.5px] leading-[1.2]">Instagram</h2>
            <div className="mt-2 w-16 sm:w-20 h-1 bg-[#cba967] mx-auto"></div>
            <p className="text-[#C7C7CC] text-sm sm:text-base max-w-2xl mx-auto mt-3 sm:mt-4">
              인스타그램에서 Bridge Makers의 최신 소식과 작업을 확인하세요
            </p>
          </div>

          {/* 인스타그램 그리드 */}
          <InstagramFeed />

          {/* 인스타그램 링크 버튼 */}
          <div className="text-center mt-6 sm:mt-8 md:mt-10">
            <a 
              href="https://instagram.com/bridgemakers_gmbh" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center py-2.5 sm:py-3 px-6 sm:px-8 rounded-full bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-medium text-[12px] sm:text-[14px] tracking-[0.25px]">@bridgemakers_gmbh 팔로우하기</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
} 