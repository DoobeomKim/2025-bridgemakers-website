'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import Image from 'next/image';

export default function TeamSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const team = [
    {
      id: 'yura',
      name: '정유라',
      role: '대표',
      title: '콘텐츠 전문가 · 브랜드 스토리텔링 디렉터',
      background: '방송사, 광고 업계 출신',
      description: '브랜드의 스토리를 효과적인 시각 언어로 전달하는 전문가입니다. 다년간의 방송 및 광고 업계 경험을 바탕으로 브랜드의 핵심 가치를 창의적으로 표현합니다.',
      expertise: ['브랜드 스토리텔링', '콘텐츠 기획', '크리에이티브 디렉션', '미디어 전략'],
      avatar: 'YJ',
      image: '/images/team/eura-jung.jpg'
    },
    {
      id: 'doobeom', 
      name: '김두범',
      role: '이사',
      title: 'IT 기반 디지털 크리에이터 · 전 과정 통합 제작자',
      background: '프로그래머, 미디어 전문가',
      description: '기술적 백그라운드를 바탕으로 한 창의적 제작 전문가입니다. 프로그래밍에서 미디어로의 전환을 통해 기술과 창의성을 결합한 독특한 접근법을 제공합니다.',
      expertise: ['웹 개발', '디지털 미디어', '기술 컨설팅', '프로젝트 관리'],
      avatar: 'DB',
      image: '/images/team/doobeom-kim.jpg'
    }
  ];

  return (
    <section 
      ref={ref}
      className="py-16 sm:py-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-[0.5px]">
            공동 창립자
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full mx-auto mb-4"></div>
          <p className="text-base sm:text-lg text-[#8E8E93] max-w-2xl mx-auto leading-[1.5] tracking-[0.25px]">
            서로 다른 배경을 가진 두 전문가가 만나 
            브랜드와 기술을 연결하는 다리를 만들어갑니다
          </p>
        </motion.div>

        {/* 팀 카드 그리드 */}
        <div className="grid lg:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.id}
              className="group"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.3 }}
              onHoverStart={() => setHoveredCard(member.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className="bg-[#F2F2F7] rounded-2xl p-6 sm:p-8 relative overflow-hidden hover:shadow-md transition-all duration-500 group-hover:scale-[1.01]">
                {/* 배경 장식 */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/50 to-amber-300/50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
                
                {/* 아바타 섹션 */}
                <div className="flex items-start space-x-4 sm:space-x-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={member.image}
                        alt={`${member.name}의 프로필 사진`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                    
                    {/* 역할 뱃지 */}
                    <div className="absolute -bottom-2 -right-2 bg-white text-amber-600 text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm border border-amber-100">
                      {member.role}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-[0.25px]">
                      {member.name}
                    </h3>
                    <p className="text-amber-600 font-medium text-sm mb-1.5">
                      {member.title}
                    </p>
                    <p className="text-xs text-[#8E8E93] bg-white/80 px-2.5 py-1 rounded-full inline-block">
                      {member.background}
                    </p>
                  </div>
                </div>

                {/* 설명 섹션 */}
                <motion.div
                  className="space-y-4"
                  initial={{ height: 'auto' }}
                  animate={{ 
                    height: hoveredCard === member.id ? 'auto' : 'auto'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm text-[#8E8E93] leading-[1.5] tracking-[0.25px]">
                    {member.description}
                  </p>

                  {/* 전문 분야 */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-[0.5px]">
                      전문 분야
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {member.expertise.map((skill, skillIndex) => (
                        <motion.span
                          key={skill}
                          className="px-2.5 py-1 bg-white text-[#8E8E93] text-xs rounded-full border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-colors"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : {}}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.3 + skillIndex * 0.1 + 0.5 
                          }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 팀 철학 */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-[0.25px]">
              "다양성이 만드는 시너지"
            </h3>
            <p className="text-sm text-[#8E8E93] leading-[1.5] tracking-[0.25px]">
              서로 다른 전문 분야에서 쌓은 경험과 노하우를 결합하여, 
              기술과 창의성이 조화를 이루는 독창적인 솔루션을 만들어냅니다.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 