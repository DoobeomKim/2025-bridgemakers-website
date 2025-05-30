'use client';

import React, { Suspense } from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useContactModal } from '@/hooks/useContactModal';

interface ContactButtonProps {
  variant?: 'primary' | 'secondary' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// Suspense 경계를 위한 내부 컴포넌트
function ContactButtonInner({ 
  variant = 'primary', 
  size = 'md', 
  text = '문의하기',
  className = ''
}: ContactButtonProps) {
  const { openModal } = useContactModal();

  // 크기별 스타일
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // 변형별 스타일
  const variantClasses = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    floating: 'fixed bottom-6 right-6 z-40 bg-[#cba967] text-white rounded-full shadow-lg hover:bg-[#b99a58] hover:shadow-xl transition-all duration-300 transform hover:scale-105'
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:ring-offset-2
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <button
      onClick={openModal}
      className={baseClasses}
      aria-label="문의하기"
      data-contact-button
    >
      {variant === 'floating' ? (
        <MessageCircle size={24} />
      ) : (
        <>
          <Phone size={18} className="mr-2" />
          {text}
        </>
      )}
    </button>
  );
}

// 메인 Contact 버튼 컴포넌트
export default function ContactButton(props: ContactButtonProps) {
  return (
    <Suspense fallback={
      // 로딩 중일 때 보여줄 기본 버튼
      <button 
        className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed" 
        disabled
      >
        문의하기
      </button>
    }>
      <ContactButtonInner {...props} />
    </Suspense>
  );
}

// 플로팅 버튼 전용 컴포넌트
export function FloatingContactButton() {
  return (
    <ContactButton 
      variant="floating" 
      className="animate-pulse-slow"
    />
  );
}

// 헤더용 간단한 버튼
export function HeaderContactButton() {
  return (
    <ContactButton 
      variant="secondary" 
      size="sm" 
      text="Contact Us"
    />
  );
}

// 히어로 섹션용 큰 버튼
export function HeroContactButton() {
  return (
    <ContactButton 
      variant="primary" 
      size="lg" 
      text="무료 상담 받기"
    />
  );
} 