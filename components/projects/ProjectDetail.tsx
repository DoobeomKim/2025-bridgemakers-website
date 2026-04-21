"use client";

import Image from 'next/image';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { Project, ProjectImage, ProjectTag } from '@/lib/database.types';
import { ShareIcon } from '@heroicons/react/24/outline';
import { getYouTubeVideoId } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Locale } from '@/lib/i18n';

interface ProjectDetailProps {
  project: Project & {
    project_images?: ProjectImage[];
    project_tag_relations?: {
      project_tags: ProjectTag;
    }[];
    // 영어 필드들 추가
    title_en?: string;
    description_en?: string;
    content_en?: string;
    category_en?: string;
    client_en?: string;
    country_en?: string;
    industry_en?: string;
  };
  locale: Locale;
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
  if (!videoId) return '';
  
  // 여러 품질의 썸네일을 시도 (YouTube Shorts는 maxresdefault가 없을 수 있음)
  // 1. maxresdefault (최고 품질) - 일반 동영상에서 주로 사용
  // 2. hqdefault (고품질) - 대부분의 동영상에서 사용 가능
  // 3. mqdefault (중품질) - 모든 동영상에서 사용 가능
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

const getYouTubeThumbnailFallback = (url: string) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return '';
  
  // 폴백용 중품질 썸네일
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export default function ProjectDetail({ project, locale }: ProjectDetailProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState('');

  // 썸네일 URL 초기화 및 폴백 처리
  useEffect(() => {
    if (project.video_url) {
      setThumbnailSrc(getYouTubeThumbnail(project.video_url));
      setThumbnailError(false);
    }
  }, [project.video_url]);

  // 썸네일 로딩 에러 처리
  const handleThumbnailError = () => {
    if (!thumbnailError && project.video_url) {
      // 첫 번째 에러: 폴백 썸네일 시도
      console.log('🖼️ 첫 번째 썸네일 실패, 폴백 썸네일 시도');
      setThumbnailSrc(getYouTubeThumbnailFallback(project.video_url));
      setThumbnailError(true);
    } else if (project.video_thumbnail_url) {
      // 두 번째 에러: 프로젝트 커스텀 썸네일 사용
      console.log('🖼️ 유튜브 썸네일 실패, 커스텀 썸네일 사용');
      setThumbnailSrc(project.video_thumbnail_url);
    } else {
      // 모든 썸네일 실패: 기본 플레이스홀더
      console.log('🖼️ 모든 썸네일 실패, 기본 플레이스홀더 사용');
      setThumbnailSrc('');
    }
  };

  // 태그 정보 추출
  const tags = project.project_tag_relations
    ? project.project_tag_relations.map(relation => relation.project_tags)
    : [];

  // 이미지 정보 추출 및 정렬
  const images = project.project_images 
    ? [...project.project_images].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  // 다국어 텍스트 선택 함수
  const getLocalizedText = (koreanText: string, englishText?: string) => {
    if (locale === 'en' && englishText && englishText.trim()) {
      return englishText;
    }
    return koreanText;
  };

  // 다국어 날짜 포맷
  const getFormattedDate = () => {
    const date = new Date(project.date);
    if (locale === 'en') {
      return format(date, 'MMMM yyyy', { locale: enUS });
    }
    return format(date, 'yyyy년 MM월', { locale: ko });
  };

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
            <p className="text-[#cba967] text-lg mb-1">{getLocalizedText(project.client, project.client_en)}</p>
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold text-white tracking-tight leading-tight">
              {getLocalizedText(project.title, project.title_en)}
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
            {thumbnailSrc ? (
              <img 
                src={thumbnailSrc}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={handleThumbnailError}
              />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">동영상 썸네일</p>
                </div>
              </div>
            )}
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
            <h3 className="text-[#cba967] text-xs mb-1">{locale === 'en' ? 'Date' : '날짜'}</h3>
            <p className="text-white">{getFormattedDate()}</p>
          </div>
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">{locale === 'en' ? 'Category' : '카테고리'}</h3>
            <p className="text-white">{getLocalizedText(project.category, project.category_en)}</p>
          </div>
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">{locale === 'en' ? 'Industry' : '산업'}</h3>
            <p className="text-white">{getLocalizedText(project.industry, project.industry_en)}</p>
          </div>
          <div className="w-full md:w-auto px-4 py-2">
            <h3 className="text-[#cba967] text-xs mb-1">{locale === 'en' ? 'Country' : '국가'}</h3>
            <p className="text-white">{getLocalizedText(project.country, project.country_en)}</p>
          </div>
        </div>

        {/* 프로젝트 설명 */}
        <div className="mt-6 px-4">
          <p className="text-[#C7C7CC] text-base leading-relaxed">{getLocalizedText(project.description, project.description_en)}</p>
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
            dangerouslySetInnerHTML={{ __html: getLocalizedText(project.content, project.content_en) }} 
          />
        </div>
      </div>
    </div>
  );
} 