'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProjectDetail from './ProjectDetail';
import { Project, ProjectImage, ProjectTag } from '@/lib/database.types';
import RelatedProjects from './RelatedProjects';
import { Locale } from '@/lib/i18n';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  lang: Locale;
}

export default function ProjectModal({ isOpen, onClose, projectSlug, lang }: ProjectModalProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);
  const [project, setProject] = useState<null | (Project & {
    project_images?: ProjectImage[];
    project_tag_relations?: {
      project_tags: ProjectTag;
    }[];
  })>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달 닫기 처리
  const handleClose = useCallback(() => {
    router.push(`/${lang}/work`, { scroll: false });
    onClose();
  }, [router, lang, onClose]);

  // ESC 키 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClose]);

  // 프로젝트 데이터 가져오기
  useEffect(() => {
    async function fetchProjectData() {
      if (!projectSlug || !isOpen) return;

      console.log('프로젝트 데이터 가져오기 시작:', projectSlug);
      setIsLoading(true);
      setError('');
      
      try {
        // 프로젝트 기본 정보 가져오기
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            project_images(*),
            project_tag_relations(
              project_tags(*)
            )
          `)
          .eq('slug', projectSlug)
          .single();

        console.log('프로젝트 데이터:', projectData);
        console.log('프로젝트 에러:', projectError);

        if (projectError) {
          throw projectError;
        }

        setProject(projectData);

        // 관련 프로젝트 가져오기
        if (projectData) {
          console.log('관련 프로젝트 가져오기 시작:', projectData.id);
          
          const { data: relatedProjectsData, error: relatedError } = await supabase
            .from('projects')
            .select('*')
            .neq('id', projectData.id)
            .or(`category.eq.${projectData.category},industry.eq.${projectData.industry}`)
            .limit(3);

          console.log('관련 프로젝트 데이터:', relatedProjectsData);
          console.log('관련 프로젝트 에러:', relatedError);

          if (!relatedError && relatedProjectsData) {
            setRelatedProjects(relatedProjectsData);
          } else {
            console.error('관련 프로젝트 에러:', relatedError);
          }
        }
      } catch (err) {
        console.error('프로젝트 데이터 가져오기 오류:', err);
        setError('프로젝트 데이터를 불러오는 중에 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectData();
  }, [projectSlug, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
    } else {
      document.body.style.overflow = 'auto';
      setProject(null);
      setRelatedProjects([]);
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-start justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 pt-4 sm:pt-8"
      onClick={handleClose}
    >
      <div 
        className={`w-full sm:w-[95%] lg:w-[95%] xl:w-[95%] 2xl:w-[95%] bg-[#050505] overflow-y-auto transition-all duration-400 ease-out ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-full opacity-0'}`}
        style={{ 
          maxHeight: '95vh', 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="sticky top-0 right-0 z-10 flex justify-end p-2 bg-gradient-to-b from-black via-black/80 to-transparent">
          <button
            onClick={handleClose}
            className="p-1.5 text-white bg-[#111]/80 border border-[#333] backdrop-blur-sm rounded-full hover:bg-[#222] transition-all hover:scale-110 shadow-lg"
            aria-label="닫기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-16 -mt-2">
          {isLoading ? (
            <div className="text-white text-center py-20">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#cba967] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4">프로젝트 정보를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-white text-center py-20">
              <p className="text-[#C7C7CC]">{error}</p>
              <p className="text-[#C7C7CC] mt-2">빠른 시일 내에 수정하겠습니다.</p>
            </div>
          ) : project ? (
            <div className="mx-auto max-w-6xl">
              <ProjectDetail project={project} />
              {relatedProjects && relatedProjects.length > 0 && (
                <RelatedProjects 
                  projects={relatedProjects} 
                  lang={lang}
                />
              )}
            </div>
          ) : (
            <div className="text-white text-center py-20">
              <p className="text-[#C7C7CC]">프로젝트를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 