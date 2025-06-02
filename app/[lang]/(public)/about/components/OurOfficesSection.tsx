'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import Image from 'next/image';

export default function OurOfficesSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const offices = [
    {
      country: '대한민국',
      city: '서울',
      address: '서울특별시 강남구',
      description: '브릿지메이커스의 본사이자 크리에이티브 허브입니다. 영상 제작, 디지털 마케팅, 웹 개발 등 핵심 서비스를 제공합니다.',
      image: '/images/office-korea.jpg',
      timezone: 'UTC+9',
      features: ['크리에이티브 스튜디오', '영상 편집실', '회의실']
    },
    {
      country: 'Deutschland',
      city: 'Berlin',
      address: 'Berlin, Germany',
      description: '유럽 시장 진출의 교두보 역할을 하는 베를린 지사입니다. 글로벌 브랜드와의 협업을 통해 혁신적인 솔루션을 제공합니다.',
      image: '/images/office-germany.jpg',
      timezone: 'UTC+1',
      features: ['비즈니스 센터', '미팅룸', '라운지']
    }
  ];

  return (
    <section 
      ref={ref}
      className="py-24 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Global Presence
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            아시아와 유럽을 잇는 브릿지메이커스의 글로벌 네트워크를 소개합니다
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {offices.map((office, index) => (
            <motion.div
              key={office.country}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <div className="aspect-[16/9] relative">
                <div className="absolute inset-0 bg-gray-900/10" />
                <Image
                  src={office.image}
                  alt={`${office.city} office`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                      {office.country}
                    </h3>
                    <p className="text-sm text-gray-600">{office.city}</p>
                  </div>
                  <span className="text-xs text-gray-500">{office.timezone}</span>
                </div>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {office.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {office.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
          </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-sm text-gray-500">
            * 방문 시 사전 예약이 필요합니다
          </p>
        </motion.div>
      </div>
    </section>
  );
} 