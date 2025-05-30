'use client';

import { Suspense } from 'react';
import { useContactModal } from '@/hooks/useContactModal';
import ContactUsModal from './ContactUsModal';

// Suspense 경계를 위한 내부 컴포넌트
function GlobalContactModalInner() {
  const { isOpen, closeModal } = useContactModal();

  return (
    <ContactUsModal 
      isOpen={isOpen} 
      onClose={closeModal} 
    />
  );
}

// 전역 Contact 모달 컴포넌트
export default function GlobalContactModal() {
  return (
    <Suspense fallback={null}>
      <GlobalContactModalInner />
    </Suspense>
  );
} 