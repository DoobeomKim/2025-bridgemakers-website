'use client';

import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';

export default function SimpleModal({
  params,
}: {
  params: {
    slug: string;
    lang: Locale;
  };
}) {
  const router = useRouter();
  const backUrl = `/${params.lang}/work`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={() => router.push(backUrl)}
    >
      <div 
        className="w-full h-[90vh] max-w-4xl mx-auto bg-black p-8 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push(backUrl)}
            className="p-2 text-white bg-[#cba967] rounded-full hover:bg-[#d9b979] transition"
          >
            ✕
          </button>
        </div>
        
        <div className="text-white text-center py-10">
          <h1 className="text-3xl font-bold mb-6">프로젝트 상세</h1>
          <p className="text-lg mb-4">슬러그: {params.slug}</p>
          <p className="text-[#C7C7CC]">현재 프로젝트 상세 정보를 불러오는 중에 문제가 발생했습니다.</p>
          <p className="text-[#C7C7CC] mt-2">빠른 시일 내에 수정하겠습니다.</p>
        </div>
      </div>
    </div>
  );
} 