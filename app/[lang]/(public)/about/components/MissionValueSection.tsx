'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

export default function MissionValueSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      ref={ref}
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
    >
      {/* 배경 장식 - 메인페이지 스타일 */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#cba967]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#cba967]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 메인 텍스트 - 메인페이지 스타일 */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-6 leading-[1.4] md:leading-[1.6] tracking-[0.5px]">
            우리는 기술을 
            <span className="text-transparent bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text mx-2">
              경험
            </span>
            으로,{' '}
            <br className="hidden md:block" />
            브랜드를{' '}
            <span className="text-transparent bg-gradient-to-r from-[#cba967] to-[#b99a58] bg-clip-text mx-2">
              이야기
            </span>
            로 연결합니다
          </h2>
        </motion.div>

        {/* 부가 설명 카드들 - 가독성 개선 */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 hover:bg-white/15 hover:border-[#cba967]/30 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-[#cba967] to-[#b99a58] rounded-full mr-3"></div>
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-white tracking-[0.25px]">우리의 미션</h3>
            </div>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-[#C7C7CC] leading-[1.6] tracking-[0.25px]">
              브랜드의 본질을 이해하고, 그 가치를 디지털 공간에서 
              효과적으로 전달할 수 있는 창의적 솔루션을 제공합니다
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/20 hover:bg-white/15 hover:border-blue-400/30 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-3"></div>
              <h3 className="text-sm md:text-base lg:text-lg font-semibold text-white tracking-[0.25px]">우리의 가치</h3>
            </div>
            <p className="text-xs sm:text-sm md:text-sm lg:text-base text-[#C7C7CC] leading-[1.6] tracking-[0.25px]">
              고객과의 신뢰를 바탕으로 혁신적인 아이디어와 
              검증된 기술력으로 지속 가능한 성장을 함께 만들어갑니다
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 