"use client";

import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Project, ProjectImage, ProjectTag } from '@/lib/database.types';
import { ShareIcon } from '@heroicons/react/24/outline';
import { getYouTubeVideoId } from '@/lib/utils';
import { useState } from 'react';

interface ProjectDetailProps {
  project: Project & {
    project_images?: ProjectImage[];
    project_tag_relations?: {
      project_tags: ProjectTag;
    }[];
  };
}

// YouTube URL 변환 함수들
const getYouTubeEmbedUrl = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '';
  
  // 임베드 옵션 설정
  const params = new URLSearchParams({
    autoplay: '1',          // 자동 재생
    rel: '1',              // 관련 동영상 숨김
    modestbranding: '1',   // YouTube 로고 최소화
    playsinline: '1',      // 모바일에서 인라인 재생
    controls: '1',         // 컨트롤 표시
    enablejsapi: '1',      // JavaScript API 활성화
    origin: typeof window !== 'undefined' ? window.location.origin : '', // 보안을 위한 origin 설정
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const getYouTubeThumbnail = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
};

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // 태그 정보 추출
  const tags = project.project_tag_relations
    ? project.project_tag_relations.map(relation => relation.project_tags)
    : [];

  // 이미지 정보 추출 및 정렬
  const images = project.project_images 
    ? [...project.project_images].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  // 날짜 형식 변환
  const formattedDate = format(new Date(project.date), 'yyyy년 MM월', { locale: ko });

  // 공유 기능
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('공유 실패:', error);
    }
  };

  return (
    <div className="py-2">
      {/* 프로젝트 헤더 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[#cba967] text-lg mb-1">{project.client}</p>
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-white tracking-tight leading-tight">
              {project.title}
            </h1>
          </div>
          <button
            onClick={handleShare}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="프로젝트 공유"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 비디오 섹션 */}
        {project.video_url ? (
          <>
            {!isVideoPlaying && (
          <div 
            className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => setIsVideoPlaying(true)}
          >
            <img 
              src={thumbnailError ? (project.video_thumbnail_url || '') : getYouTubeThumbnail(project.video_url)}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={() => setThumbnailError(true)}
            />
            <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/15">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286l-11.54 6.347c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
            {isVideoPlaying && (
          <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden bg-black">
            <iframe
              src={getYouTubeEmbedUrl(project.video_url)}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
            )}
          </>
        ) : (
          project.video_thumbnail_url && (
            <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src={project.video_thumbnail_url}
                alt={project.title}
                fill
                className="object-cover"
                sizes="100vw"
                quality={95}
                priority
                unoptimized={true}
              />
            </div>
          )
        )}

        {/* 메타 정보 2x2 그리드 */}
        <div className="grid grid-cols-2 md:flex md:flex-nowrap items-start md:items-center justify-between max-w-3xl text-sm gap-2 md:gap-0">
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">날짜</h3>
            <p className="text-white">{formattedDate}</p>
          </div>
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">카테고리</h3>
            <p className="text-white">{project.category}</p>
          </div>
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">산업</h3>
            <p className="text-white">{project.industry}</p>
          </div>
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">국가</h3>
            <p className="text-white">{project.country}</p>
          </div>
        </div>

        {/* 프로젝트 설명 */}
        <div className="mt-6 px-4">
          <p className="text-[#C7C7CC] text-base leading-relaxed">{project.description}</p>
        </div>

        {/* 태그 */}
        {tags.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block bg-[rgba(203,169,103,0.1)] text-[#cba967] rounded-full px-4 py-1 text-sm"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 갤러리 이미지 */}
        {images.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {images.map((image) => (
                <div key={image.id} className="relative aspect-video rounded-xl overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={`${project.title} 이미지`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={95}
                    priority={image.sort_order < 2}
                    unoptimized={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 프로젝트 상세 설명 */}
        <div className="mt-8">
          <div 
            className="prose prose-invert max-w-none [&>p]:text-[#C7C7CC] [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white [&>ul]:text-[#C7C7CC] [&>ol]:text-[#C7C7CC] [&>li]:text-[#C7C7CC] [&>blockquote]:text-[#C7C7CC]" 
            dangerouslySetInnerHTML={{ __html: project.content }} 
          />
        </div>
      </div>
    </div>
  );
} 