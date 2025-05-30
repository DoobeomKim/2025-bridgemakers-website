'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function useContactModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 🔄 URL 쿼리 파라미터와 모달 상태 동기화
  useEffect(() => {
    const contactParam = searchParams.get('contact');
    const shouldOpen = contactParam === 'true';
    
    if (shouldOpen !== isOpen) {
      setIsOpen(shouldOpen);
    }
  }, [searchParams, isOpen]);

  // 📖 모달 열기 함수
  const openModal = () => {
    console.log('📞 Contact 모달 열기');
    
    // 현재 URL에 ?contact=true 추가
    const params = new URLSearchParams(searchParams.toString());
    params.set('contact', 'true');
    
    // 히스토리에 새 상태 추가 (뒤로가기 지원)
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 📕 모달 닫기 함수
  const closeModal = () => {
    console.log('📞 Contact 모달 닫기');
    
    // URL에서 contact 파라미터 제거
    const params = new URLSearchParams(searchParams.toString());
    params.delete('contact');
    
    const newUrl = params.toString() 
      ? `${pathname}?${params.toString()}`
      : pathname;
    
    // 히스토리에서 이전 상태로 이동 (뒤로가기와 동일한 효과)
    router.replace(newUrl, { scroll: false });
  };

  // 🚫 뒤로가기 버튼 처리
  useEffect(() => {
    const handlePopState = () => {
      // URL 파라미터 변경시 자동으로 모달 상태가 업데이트됨
      // 추가 처리 불필요
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
  };
} 