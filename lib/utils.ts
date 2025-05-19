import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { slugify as transliterate } from "transliterate"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ProjectData {
  client?: string;
  category?: string;
  category_name?: string;
  date?: string;
  title?: string;
  description?: string;
  content?: string;
  country?: string;
  industry?: string;
  industry_name?: string;
  image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  visibility?: 'public' | 'private';
  slug?: string;
  tags?: string[];
}

// 슬러그 생성 유틸리티 함수
export function generateSlug(projectData: ProjectData): string {
  try {
    const parts: string[] = [];
    
    // 1. 연도 추출 (date가 있는 경우)
    if (projectData.date) {
      const year = new Date(projectData.date).getFullYear();
      parts.push(year.toString());
    } else {
      parts.push(new Date().getFullYear().toString());
    }

    // 2. 클라이언트명 처리
    if (projectData.client) {
      const clientSlug = transliterate(projectData.client.toLowerCase())
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      if (clientSlug) parts.push(clientSlug);
    }

    // 3. 카테고리 처리
    if (projectData.category) {
      const categorySlug = transliterate(projectData.category.toLowerCase())
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      if (categorySlug) parts.push(categorySlug);
    }

    // 최종 슬러그 생성
    let slug = parts.join('-');
    
    // 슬러그가 비어있거나 유효하지 않은 경우 대체 슬러그 생성
    if (!slug || slug.length < 3) {
      const timestamp = new Date().getTime();
      return `project-${timestamp}`;
    }

    // 연속된 하이픈 제거
    slug = slug.replace(/-+/g, '-');
    
    return slug;
  } catch (error) {
    console.error('슬러그 생성 중 오류 발생:', error);
    const timestamp = new Date().getTime();
    return `project-${timestamp}`;
  }
}

/**
 * YouTube URL에서 비디오 ID를 추출하는 함수
 * 지원하는 URL 형식:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // URL 객체로 파싱 시도
  try {
    const urlObj = new URL(url);
    
    // youtu.be 형식
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // youtube.com 형식
    if (urlObj.hostname.includes('youtube.com')) {
      // watch?v= 형식
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
      
      // embed/ 형식
      if (urlObj.pathname.startsWith('/embed/')) {
        return urlObj.pathname.split('/')[2];
      }
    }
    
    // 지원하지 않는 형식
    return null;
  } catch {
    // URL이 아닌 경우 video ID로 간주
    return url;
  }
}

/**
 * Supabase Storage URL인 경우 원본 URL을 반환하고,
 * 그 외의 경우 이미지 URL을 그대로 반환합니다.
 */
export const getImageUrl = (url: string) => {
  if (!url) return '/images/project-1.jpg';
  if (url.includes('supabase.co')) return url;
  return url;
};
