'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/database.types';
import { Locale } from '@/lib/i18n';
import { normalizeImageUrl, isSupabaseStorageUrl } from '@/lib/imageUtils';

interface RelatedProjectsProps {
  projects: (Project & {
    title_en?: string;
    client_en?: string;
    category_en?: string;
  })[];
  lang: Locale;
  openModal?: (slug: string) => void;
}

export default function RelatedProjects({ projects, lang, openModal }: RelatedProjectsProps) {
  const router = useRouter();
  const [failedImages, setFailedImages] = useState(new Set<string>());
  
  if (!projects || projects.length === 0) return null;

  // 다국어 텍스트 선택 함수
  const getLocalizedText = (koreanText: string, englishText?: string) => {
    if (lang === 'en' && englishText && englishText.trim()) {
      return englishText;
    }
    return koreanText;
  };

  const handleProjectClick = (slug: string) => {
    if (openModal) {
      openModal(slug);
    } else {
      router.push(`/${lang}/work?project=${slug}`, { scroll: false });
    }
  };

  return (
    <div className="py-10 border-t border-[rgba(255,255,255,0.1)]">
      <h2 className="text-white text-2xl font-bold mb-8">
        {lang === 'en' ? 'You Might Also Like' : '관련 프로젝트'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="group">
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#050a16]">
              <div 
                className="cursor-pointer" 
                onClick={() => handleProjectClick(project.slug)}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image 
                    src={failedImages.has(project.id) ? '/images/project-1.jpg' : project.image_url || '/images/project-1.jpg'}
                    alt={getLocalizedText(project.title, project.title_en)} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => {
                      console.error(`이미지 로드 실패 [${project.title}]:`, project.image_url);
                      setFailedImages(prev => new Set([...prev, project.id]));
                    }}
                    priority
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#cba967] transition-colors">
                  <div 
                    className="cursor-pointer" 
                    onClick={() => handleProjectClick(project.slug)}
                  >
                    {getLocalizedText(project.title, project.title_en)}
                  </div>
                </h3>
                <div className="mt-3 flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-3">
                  <div className="text-sm text-white">{getLocalizedText(project.client, project.client_en)}</div>
                  <div className="text-sm text-[#cba967]">{getLocalizedText(project.category, project.category_en)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 