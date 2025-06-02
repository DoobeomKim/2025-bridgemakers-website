'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function HeroIntroSection() {
  const scrollToNextSection = () => {
    const nextSection = document.getElementById('about-us-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* 배경 애니메이션 - 메인페이지 스타일 적용 */}
      <div className="absolute inset-0">
        {/* 금색 뭉개구름 효과 (메인페이지와 유사) */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#cba967]/30 to-[#b99a58]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-l from-[#cba967]/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#cba967]/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* 부드러운 선형 애니메이션 - 속도 40% 느리게 */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-r from-transparent via-[#cba967]/30 to-transparent"
              style={{
                width: '200%',
                height: '1px',
                top: `${30 + i * 20}%`,
                left: '-50%',
              }}
              animate={{
                x: ['0%', '100%'],
              }}
              transition={{
                duration: (12 + i * 3) * 1.4, // 40% 느리게
                repeat: Infinity,
                ease: 'linear',
                delay: i * 3,
              }}
            />
          ))}
        </div>

        {/* 빛의 파티클 효과 - 개선된 버전 */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `radial-gradient(circle, #cba967 0%, #b99a58 50%, transparent 100%)`,
                boxShadow: `0 0 ${8 + Math.random() * 12}px #cba967, 0 0 ${16 + Math.random() * 24}px #cba967/50`,
              }}
              animate={{
                y: [0, -40 - Math.random() * 20, 0],
                opacity: [0, 0.8, 0.9, 0.6, 0],
                scale: [0.5, 1, 1.2, 0.8, 0.3],
              }}
              transition={{
                duration: (4 + Math.random() * 3) * 1.4, // 40% 느리게
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 추가 광원 효과 */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`glow-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                background: `radial-gradient(circle, #cba967/60 0%, #cba967/30 30%, transparent 70%)`,
                filter: 'blur(1px)',
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: (3 + Math.random() * 2) * 1.4, // 40% 느리게
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* 중앙 콘텐츠 - 메인페이지 스타일 적용 */}
      <div className="relative z-10 text-center px-4 max-w-5xl pt-0 sm:pt-8 md:pt-0">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-[0.5px] leading-[1.2] mb-6 sm:mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="block mb-2 sm:mb-3 md:mb-5">창의성과 기술이 만나는 곳,</span>
          <span className="block text-[#cba967]">
            BRIDGEMAKERS
          </span>
        </motion.h1>

        <motion.p
          className="text-sm sm:text-base md:text-lg text-[#C7C7CC] max-w-3xl mx-auto leading-[1.5] tracking-[0.25px] mb-6 sm:mb-10 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          브랜드의 비전을 시각화하고 연결합니다.
        </motion.p>

        <motion.button
          onClick={scrollToNextSection}
          className="button-primary inline-flex items-center justify-between py-2.5 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-[#b99a58] transform hover:translate-y-[-2px] transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-medium text-[13px] sm:text-[14px] tracking-[0.25px]">우리가 하는 일 보기</span>
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </motion.svg>
        </motion.button>
      </div>

      {/* 하단 스크롤 인디케이터 - 위치를 위로 올림 */}
      <motion.div
        className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-[#C7C7CC]/50 rounded-full p-1"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-[#cba967] rounded-full mx-auto"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
} 