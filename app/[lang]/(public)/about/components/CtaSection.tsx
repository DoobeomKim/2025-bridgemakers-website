'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import Link from 'next/link';
import { useContactModal } from '@/hooks/useContactModal';

export default function CtaSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { openModal } = useContactModal();

  return (
    <>
      <section 
        ref={ref}
        className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden"
      >
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          {/* 그라데이션 오브 */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          {/* 동적 선 애니메이션 */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
                style={{
                  width: '150%',
                  height: '1px',
                  top: `${30 + i * 20}%`,
                  left: '-25%',
                }}
                animate={{
                  x: ['0%', '50%'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 6 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* 메인 슬로건 */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-[0.5px] whitespace-pre-line">
                우리와 함께 하세요{' '}
                <br className="hidden sm:block" />
                세상과 통하는{' '}
                <span className="text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text">
                  다리
                </span>
                가 되겠습니다
              </h2>
              
              <motion.p
                className="text-base sm:text-lg text-[#C7C7CC] max-w-3xl mx-auto leading-[1.5] tracking-[0.25px] whitespace-pre-line"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.6 }}
              >
                {'창의적인 아이디어와 검증된 기술력으로\n여러분의 브랜드를 세상과 연결해드립니다'}
              </motion.p>
            </motion.div>

            {/* CTA 버튼 그룹 */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {/* 주요 CTA 버튼 */}
              <motion.button
                onClick={openModal}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-base rounded-full shadow-xl shadow-amber-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/40"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="relative z-10 flex items-center">
                  프로젝트 문의하기
                  <motion.span
                    className="ml-2 text-lg"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                
                {/* 버튼 글로우 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </motion.button>

              {/* 보조 CTA 버튼 */}
              <Link href="/work">
                <motion.button
                  className="px-6 py-3 border-2 border-white/30 text-white font-medium text-base rounded-full hover:border-amber-400 hover:text-amber-400 transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  포트폴리오 보기
                </motion.button>
              </Link>
            </motion.div>

            {/* 하단 연락처 정보 */}
            <motion.div
              className="mt-12 sm:mt-16 grid md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              {[
                {
                  icon: '📧',
                  title: '이메일 문의',
                  content: 'eurajung@ibridgemakers.de',
                  link: `mailto:eurajung@ibridgemakers.de?subject=${encodeURIComponent('프로젝트 상담 및 견적문의 드립니다.')}&body=${encodeURIComponent('안녕하세요, 브릿지메이커스에 문의드립니다.\n\n의뢰인명(회사명):\n\n문의내용:\n\n연락처(선택):\n')}`,
                  description: '프로젝트 상담 및 견적 문의'
                },
                {
                  icon: '💬',
                  title: '빠른 상담',
                  content: '카카오톡 채널',
                  link: 'https://open.kakao.com/o/s9qPeqpg',
                  description: '실시간 채팅 상담 가능'
                },
                {
                  icon: '📞',
                  title: '전화 상담',
                  content: [
                    { 
                      text: '+82-10-4254-0711 (KO)',
                      link: 'tel:+821042540711'
                    },
                    {
                      text: '+49 176 2497 7603 (EU)',
                      link: 'tel:+491762497603'
                    }
                  ]
                }
              ].map((contact, index) => (
                <motion.div
                  key={contact.title}
                  className="text-center p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                >
                  <div className="text-2xl mb-2">{contact.icon}</div>
                  <h3 className="text-white font-medium mb-1.5">{contact.title}</h3>
                  {contact.link ? (
                    <a 
                      href={contact.link} 
                      target={contact.link.startsWith('mailto:') ? '_self' : '_blank'}
                      rel={contact.link.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                      className="text-amber-400 text-sm font-medium mb-1 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {contact.content}
                    </a>
                  ) : (
                    Array.isArray(contact.content) ? (
                      contact.content.map((item, i) => (
                        <a
                          key={i}
                          href={item.link}
                          className="text-amber-400 text-sm font-medium mb-1 block hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          {item.text}
                        </a>
                      ))
                    ) : (
                      <p className="text-amber-400 text-sm font-medium mb-1">{contact.content}</p>
                    )
                  )}
                  {contact.description && (
                    <p className="text-[#C7C7CC] text-xs">{contact.description}</p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
} 