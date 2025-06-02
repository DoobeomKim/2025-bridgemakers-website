'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';

export default function AboutUsSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // 이미지 슬라이더 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 원본 이미지들
  const images = [
    {
      src: "/images/about/about-1.jpg",
      alt: "브릿지메이커스 팀 협업"
    },
    {
      src: "/images/about/about-2.jpg",
      alt: "디지털 마케팅 분석"
    },
    {
      src: "/images/about/about-3.jpg",
      alt: "영상 제작 현장"
    }
  ];

  // 이미지 자동 전환 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section 
      ref={ref}
      className="py-16 sm:py-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 이미지 슬라이더 섹션 - 모바일에서는 16:9, 데스크톱에서는 1:1 비율 */}
          <motion.div
            className="relative aspect-[16/9] lg:aspect-square rounded-2xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <Image
                    src={images[currentImageIndex].src}
                    alt={images[currentImageIndex].alt}
                    fill
                    className="object-cover object-[65%_center]"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              {/* 이미지 오버레이 효과 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              {/* 이미지 인디케이터 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-[#cba967] w-6' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* 컨텐츠 섹션 - 텍스트 크기와 간격 조정 */}
          <motion.div
            className="lg:pl-8"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
          >
            <div className="space-y-8">
              <div>
                <motion.h2 
                  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-[#cba967]">브릿지메이커스</span>
                </motion.h2>

                <div className="space-y-6 text-[#8E8E93] leading-relaxed">
                  <p className="text-base">
                    <strong className="text-black font-semibold">기업 홍보 및 광고 영상, 웹사이트, 디지털 마케팅 솔루션 전문 에이전시</strong>로서, 
                    브랜드의 가치를 시각적으로 전달하는 창의적인 솔루션을 제공합니다.
                  </p>
                  
                  <p className="text-base">
                    한국 홈쇼핑 영상부터 이커머스 프로모션까지, 다양한 플랫폼에서 
                    신뢰받는 프로젝트를 수행하며 
                    클라이언트의 비즈니스 성장을 지원해왔습니다.
                  </p>

                  <p className="text-base">
                    우리는 단순한 제작사가 아닙니다. 브랜드와 고객 사이의 
                    <strong className="font-semibold"> 다리 역할</strong>을 하며, 
                    기술과 창의성을 결합하여 의미 있는 연결을 만들어냅니다.
                  </p>
                </div>
              </div>

              {/* 통계 그리드 - 간격과 크기 조정 */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '프로젝트 완료', value: '200+' },
                  { label: '글로벌 경험', value: '8년' },
                  { label: '만족도', value: '98%' },
                  { label: '전문 분야', value: '4+' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-4 bg-[#F2F2F7] rounded-xl border border-[#F2F2F7] hover:border-[#cba967]/20 hover:shadow-md transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="text-xl font-semibold text-[#cba967] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[#8E8E93] font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 