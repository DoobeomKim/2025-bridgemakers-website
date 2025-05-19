'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';

interface ModalContainerProps {
  children: React.ReactNode;
  backUrl: string; // 모달 닫을 때 이동할 URL
}

export default function ModalContainer({ children, backUrl }: ModalContainerProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ESC 키 또는 오버레이 클릭 시 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(backUrl);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        router.push(backUrl);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    // 스크롤 비활성화
    document.body.style.overflow = 'hidden';

    // 모달 슬라이드 업 애니메이션
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'translateY(0)';
        }
      }, 10);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [router, backUrl]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div 
        ref={contentRef}
        className="w-full h-[90vh] bg-black overflow-y-auto transition-transform duration-500 ease-out"
        style={{ maxHeight: '90vh' }}
      >
        <div className="sticky top-0 right-0 z-10 flex justify-end p-4 bg-gradient-to-b from-black to-transparent">
          <button
            onClick={() => router.push(backUrl)}
            className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition"
            aria-label="닫기"
          >
            <XIcon size={24} />
          </button>
        </div>
        <div className="px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </div>
    </div>
  );
} 