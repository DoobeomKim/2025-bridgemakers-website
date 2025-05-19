"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { normalizeImageUrl, isSupabaseStorageUrl } from '@/lib/imageUtils';

interface ProjectsTableRowProps {
  project: {
    id: string;
    title: string;
    visibility: 'public' | 'private';
    created_at: string;
    date: string;
    image_url?: string;
    client?: string;
    [key: string]: any;
  };
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  locale: string;
}

export default function ProjectsTableRow({
  project,
  selected,
  onSelect,
  locale
}: ProjectsTableRowProps) {
  const [imageError, setImageError] = useState(false);
  
  // 이미지 URL 저장 - 공통 유틸리티 함수 사용
  const imageUrl = normalizeImageUrl(project.image_url);
  const hasValidImage = !!imageUrl && !imageError;
  const isSupabaseImage = isSupabaseStorageUrl(imageUrl);
  
  // 날짜 포맷팅
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      // YYYY-MM-DD 형식이면 그대로 반환
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // ISO 형식의 날짜면 YYYY-MM-DD 형식으로 변환
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '-';
    }
  };
  
  // 이미지 오류 핸들러 - 오류 로그 없이 상태만 업데이트
  const handleImageError = () => {
    setImageError(true);
  };
  
  // 수정 페이지로 이동하는 함수
  const handleEdit = (e: React.MouseEvent) => {
    // 체크박스나 이미지 정보 버튼 클릭 시에는 이동하지 않음
    if ((e.target as HTMLElement).closest('input[type="checkbox"]') || 
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    window.location.href = `/${locale}/dashboard/projects/${project.id}`;
  };
  
  return (
    <tr 
      className="hover:bg-[#232b3d] cursor-pointer border-b border-[#232b3d]"
      onClick={handleEdit}
    >
      <td className="py-1.5 md:py-2 px-2 md:px-4">
        <input
          type="checkbox"
          className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
          checked={selected}
          onChange={(e) => onSelect(project.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="py-1.5 md:py-2 px-2 md:px-4">
        <div className="w-16 md:w-24 h-12 md:h-16 relative bg-gray-800 rounded overflow-hidden shadow-md">
          {hasValidImage ? (
            <Image
              src={imageUrl}
              alt={project.title || '프로젝트 이미지'}
              fill
              sizes="96px"
              className="object-cover"
              style={{ objectPosition: 'center' }}
              onError={handleImageError}
              unoptimized={isSupabaseImage}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A2234]">
              <PhotoIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
              <span className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">이미지 없음</span>
            </div>
          )}
        </div>
      </td>
      <td className="py-1.5 md:py-2 px-2 md:px-4">
        <div className="font-medium text-xs md:text-sm text-white">{project.title}</div>
        <div className="text-[10px] md:text-xs text-gray-400">{project.client || '-'}</div>
      </td>
      <td className="hidden md:table-cell py-1.5 md:py-2 px-2 md:px-4">
        {(project.visibility || 'private') === 'public' ? (
          <div className="flex items-center text-xs md:text-sm">
            <span className="flex items-center bg-[#232b3d] text-[#cba967] px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <EyeIcon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
              공개
            </span>
          </div>
        ) : (
          <div className="flex items-center text-xs md:text-sm">
            <span className="flex items-center bg-[#232b3d] text-gray-400 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <EyeSlashIcon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
              비공개
            </span>
          </div>
        )}
      </td>
      <td className="py-1.5 md:py-2 px-2 md:px-4 text-[10px] md:text-sm">
        {formatDate(project.date)}
      </td>
      <td className="py-1.5 md:py-2 px-2 md:px-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/${locale}/dashboard/projects/${project.id}`;
          }}
          className="bg-[#232b3d] hover:bg-[#2d374b] text-[#cba967] py-0.5 md:py-1 px-2 md:px-3 rounded-standard text-[10px] md:text-sm transition-all duration-200 shadow-sm"
        >
          수정
        </button>
      </td>
    </tr>
  );
} 