import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { slugify } from "transliterate"
import { supabase } from "../lib/supabase"

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

/**
 * 한글 텍스트를 영어로 번역하는 함수
 */
async function translateToEnglish(text: string): Promise<string> {
  if (!text) return '';
  
  // 영어나 숫자만 있는 경우 번역하지 않음
  if (/^[a-zA-Z0-9\s-]+$/.test(text)) {
    return text;
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_PAPAGO_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_PAPAGO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn('Papago API 키가 설정되지 않았습니다.');
      return text;
    }

    const response = await fetch('https://openapi.naver.com/v1/papago/n2mt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
      body: JSON.stringify({
        source: 'ko',
        target: 'en',
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error('번역 요청 실패');
    }

    const data = await response.json();
    return data.message?.result?.translatedText || text;
  } catch (error) {
    console.error('번역 중 오류 발생:', error);
    return text;
  }
}

// 슬러그 생성 유틸리티 함수 수정
export async function generateSlug(projectData: ProjectData): Promise<string> {
  try {
    const parts: string[] = [];
    
    // 1. 연도 추출 (date가 있는 경우)
    if (projectData.date) {
      const year = new Date(projectData.date).getFullYear();
      parts.push(year.toString());
    } else {
      parts.push(new Date().getFullYear().toString());
    }

    // 2. 클라이언트명 처리 (번역 후)
    if (projectData.client) {
      const translatedClient = await translateToEnglish(projectData.client);
      const clientSlug = slugify(translatedClient.toLowerCase());
      if (clientSlug) parts.push(clientSlug);
    }

    // 3. 카테고리 처리 (번역 후)
    if (projectData.category) {
      const translatedCategory = await translateToEnglish(projectData.category);
      const categorySlug = slugify(translatedCategory.toLowerCase());
      if (categorySlug) parts.push(categorySlug);
    }

    // 4. 제목 처리 (번역 후)
    if (projectData.title) {
      const translatedTitle = await translateToEnglish(projectData.title);
      const titleSlug = slugify(translatedTitle.toLowerCase());
      if (titleSlug) parts.push(titleSlug);
    }

    // 기본 슬러그 생성
    let baseSlug = parts.join('-');
    
    // 슬러그가 비어있거나 유효하지 않은 경우 대체 슬러그 생성
    if (!baseSlug || baseSlug.length < 3) {
      const timestamp = new Date().getTime();
      return `project-${timestamp}`;
    }

    // 연속된 하이픈 제거
    baseSlug = baseSlug.replace(/-+/g, '-');
    
    // 중복 확인 및 처리
    const { data: existingProject } = await supabase
      .from('projects')
      .select('slug')
      .eq('slug', baseSlug)
      .single();

    if (!existingProject) {
      return baseSlug;
    }

    // 중복이 있는 경우 숫자를 붙여서 유니크한 슬러그 생성
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;

    while (true) {
      const { data: duplicateProject } = await supabase
        .from('projects')
        .select('slug')
        .eq('slug', newSlug)
        .single();

      if (!duplicateProject) {
        return newSlug;
      }

      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
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
