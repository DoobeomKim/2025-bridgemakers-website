import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// 서비스 롤 키를 사용하는 새로운 Supabase 클라이언트 생성 (서버 사이드에서만 실행됨)
const supabaseAdmin = typeof window === 'undefined' 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  : supabase; // 클라이언트 사이드에서는 기존 클라이언트 사용

// 최대 이미지 크기 설정 (1920x1080)
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

/**
 * 이미지 리사이징 함수
 * @param file 원본 이미지 파일
 * @returns 리사이징된 이미지 Blob과 URL
 */
export const resizeImage = async (file: File): Promise<{ blob: Blob; url: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 이미지 크기 계산
        let width = img.width;
        let height = img.height;
        
        // 최대 크기를 초과하는 경우 리사이징
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // 캔버스에 이미지 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 이미지 품질 (0.8 = 80%)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 변환 실패'));
              return;
            }
            
            const resizedUrl = URL.createObjectURL(blob);
            resolve({ blob, url: resizedUrl });
          },
          file.type,
          0.8
        );
      };
      
      img.onerror = () => {
        reject(new Error('이미지 로드 실패'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };
  });
};

/**
 * Supabase 스토리지에 이미지 업로드
 * @param file 업로드할 이미지 파일
 * @returns 업로드된 이미지의 URL
 */
export const uploadImageToStorage = async (file: File): Promise<string> => {
  try {
    console.log('이미지 업로드 시작:', file.name, file.type, file.size);
    
    // 파일 리사이징
    const { blob } = await resizeImage(file);
    console.log('이미지 리사이징 완료, 크기:', blob.size);
    
    // 파일 이름 생성 (유니크한 ID + 원본 확장자)
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `project-thumbnails/${fileName}`;
    console.log('생성된 파일 경로:', filePath);
    
    // Supabase 스토리지에 업로드 (클라이언트 사이드에서는 RLS 우회 방법 사용)
    const base64Data = await blobToBase64(blob);
    console.log('Base64 변환 완료, 길이:', base64Data.length);
    
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: filePath,
        fileType: file.type,
        fileData: base64Data,
      }),
    });
    
    const result = await response.json();
    console.log('서버 응답:', result);
    
    if (!response.ok || result.error) {
      throw new Error(result.error?.message || '이미지 업로드 실패');
    }
    
    // 서버에서 반환된 URL 사용
    if (result.publicUrl) {
      console.log('서버에서 반환된 이미지 URL 사용:', result.publicUrl);
      return result.publicUrl;
    }
    
    // 대체 방법: 클라이언트에서 URL 생성
    console.log('클라이언트에서 URL 생성');
    const { data } = supabase.storage.from('projects').getPublicUrl(filePath);
    console.log('생성된 이미지 URL:', data.publicUrl);
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('이미지 업로드 오류:', error);
    throw new Error(error.message || '이미지 업로드 중 오류가 발생했습니다');
  }
};

// Blob을 base64 문자열로 변환하는 유틸리티 함수
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // data:image/jpeg;base64, 부분 제거하고 순수 base64 데이터만 반환
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * 이미지 URL 관련 유틸리티 함수
 */

// Supabase URL (환경 변수에서 가져오기)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

/**
 * 이미지 URL을 정규화하는 함수
 * 1. Supabase 스토리지 URL을 완전한 형태로 변환
 * 2. 상대 경로 URL을 처리
 * 3. 절대 URL을 처리
 */
export function normalizeImageUrl(url?: string | null): string | null {
  if (!url) return null;
  
  // 이미 절대 URL인 경우 (http나 https로 시작)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Supabase Storage URL인 경우 - 공개 버킷 접근 권한 확인
    if (url.includes('supabase.co/storage/v1/object/public')) {
      // 이미 정상적인 형태의 URL이므로 그대로 반환
      return url;
    }
    return url;
  }
  
  // 상대 경로이지만 /storage로 시작하는 경우 (Supabase 스토리지 상대 경로)
  if (url.startsWith('/storage/')) {
    // Supabase URL을 앞에 붙여 완전한 URL로 변환
    return `${supabaseUrl}${url}`;
  }
  
  // storage/ 로 시작하는 경우 (슬래시 없는 상대 경로)
  if (url.startsWith('storage/')) {
    // 슬래시를 추가하고 Supabase URL 붙이기
    return `${supabaseUrl}/${url}`;
  }
  
  // 프로젝트 등 특정 경로로 시작하는 경우
  if (url.includes('projects/') || url.includes('project-thumbnails/')) {
    // storage/v1/object/public/ 경로를 포함하는지 확인
    if (url.includes('storage/v1/object/public/')) {
      return url; // 이미 전체 경로가 있는 경우
    }
    // Supabase 공개 스토리지 경로 구성
    return `${supabaseUrl}/storage/v1/object/public/${url}`;
  }
  
  // 단순 상대 경로인 경우 (예: /images/project-1.jpg)
  if (url.startsWith('/')) {
    return url;
  }
  
  // 그 외의 경우 원본 경로 반환
  return url;
}

/**
 * 이미지 URL이 Supabase 스토리지 URL인지 확인하는 함수
 */
export function isSupabaseStorageUrl(url?: string | null): boolean {
  if (!url) return false;
  
  return url.includes('supabase.co/storage/') || 
         url.startsWith('/storage/') || 
         url.startsWith('storage/');
}

/**
 * 임시 이미지 URL 생성 함수 - 로컬 이미지가 없을 때 사용
 */
export function getPlaceholderImageUrl(width = 300, height = 200): string {
  return `https://placehold.co/${width}x${height}/1A2234/FFFFFF?text=No+Image`;
} 