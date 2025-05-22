"use client";

import { useEffect, useState } from "react";
import { getProjects, deleteProjects, updateProjectsVisibility } from "@/lib/projects";
import { useAuth } from '@/components/auth/AuthContext';
import { Locale } from "@/lib/i18n";
import ProjectsTable from "@/components/dashboard/projects/ProjectsTable";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, PlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ProjectCreateModal from "@/components/dashboard/projects/ProjectCreateModal";
import { UserRole } from '@/types/supabase';

interface ProjectsClientProps {
  locale: Locale;
  translations: { [key: string]: string };
}

// ProjectData 인터페이스로 이름 변경 (충돌 방지)
interface ProjectData {
  id: string;
  name: string;
  created_at: string;
  client?: string;
  title?: string;
  description?: string;
  content?: string;
  country?: string;
  category?: string;
  industry?: string;
  tags?: string[];
  visibility: 'public' | 'private'; // 필수 필드로 변경
  image_url?: string; // thumbnail을 image_url로 변경
  video_url?: string;
  video_thumbnail_url?: string;
  slug?: string;
  [key: string]: any;
}

export default function ProjectsClient({ locale, translations }: ProjectsClientProps) {
  const { userProfile, isLoading: userLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);

  // 프로젝트 목록 로딩 함수
  const loadProjects = () => {
    if (userProfile?.user_level === UserRole.ADMIN) {
      getProjects().then(data => {
        // 데이터 처리 - 필요한 필드가 없을 경우 기본값 설정
        const processedData = data.map((p: any) => ({
          ...p,
          client: p.client || '-',
          title: p.title || '-',
          country: p.country || '-',
          category: p.category || '-',
          tags: p.tags || [],
          visibility: p.visibility || 'private', // 기본값은 비공개
          image_url: p.image_url || null,
          created_at: p.created_at || new Date().toISOString(), // 생성 날짜 기본값
        }));
        setProjects(processedData);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadProjects();
  }, [userProfile]);

  // 검색 처리 함수
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 검색 적용된 프로젝트 목록
  const filteredProjects = searchQuery.trim() === '' 
    ? projects 
    : projects.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // 선택 상태 업데이트 함수
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  };

  // 프로젝트 생성 모달 열기
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  // 프로젝트 생성 성공 후 처리
  const handleCreateSuccess = () => {
    loadProjects(); // 프로젝트 목록 새로고침
  };

  // 프로젝트 삭제 처리
  const handleDelete = async () => {
    if (!selectedItems.length || isDeleting) return;
    
    if (!confirm(`선택한 ${selectedItems.length}개의 프로젝트를 삭제하시겠습니까?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await deleteProjects(selectedItems);
      if (result.success) {
        // 삭제 성공
        setSelectedItems([]);
        loadProjects(); // 목록 새로고침
      } else {
        alert('프로젝트 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      alert('프로젝트 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 공개 설정 변경 처리
  const handleVisibilityChange = async (visibility: 'public' | 'private') => {
    if (!selectedItems.length || isUpdatingVisibility) return;
    
    setIsUpdatingVisibility(true);
    try {
      const result = await updateProjectsVisibility(selectedItems, visibility);
      if (result.success) {
        // 변경 성공
        setSelectedItems([]);
        loadProjects(); // 목록 새로고침
        setShowVisibilityMenu(false);
      } else {
        alert('공개 설정 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('공개 설정 변경 오류:', error);
      alert('공개 설정 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  if (userLoading) return <div className="text-white p-8">권한 확인중...</div>;
  if (userProfile?.user_level !== UserRole.ADMIN) {
    return <div className="text-red-500 p-8 text-center text-lg font-bold">접근 권한이 없습니다.</div>;
  }
  if (loading) return <div className="text-white p-8">로딩중...</div>;

  return (
    <div className="space-y-4">
      {/* 상단 툴바 */}
      {selectedItems.length > 0 ? (
        <div className="bg-[#1A2234] rounded-lg p-3 md:p-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs md:text-sm text-white">
            {selectedItems.length}개 선택됨
          </span>
          
          {/* 공개 설정 변경 버튼 */}
          <div className="relative">
            <button
              className="bg-[#232b3d] hover:bg-[#2d374b] text-white py-1 md:py-1.5 px-2 md:px-3 rounded-standard text-xs md:text-sm transition-all duration-200 flex items-center space-x-1"
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            >
              <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>공개 설정 변경</span>
            </button>
            
            {showVisibilityMenu && (
              <div className="absolute top-full left-0 mt-1 w-32 md:w-40 bg-[#232b3d] rounded-standard shadow-lg border border-[#353f54] overflow-hidden z-10">
                <button
                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white hover:bg-[#2d374b] flex items-center space-x-1 md:space-x-2"
                  onClick={() => handleVisibilityChange('public')}
                >
                  <EyeIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>공개로 변경</span>
                </button>
                <button
                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white hover:bg-[#2d374b] flex items-center space-x-1 md:space-x-2"
                  onClick={() => handleVisibilityChange('private')}
                >
                  <EyeSlashIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>비공개로 변경</span>
                </button>
              </div>
            )}
          </div>
          
          {/* 삭제 버튼 */}
          <button
            className="bg-red-600 hover:bg-red-700 text-white py-1 md:py-1.5 px-2 md:px-3 rounded-standard text-xs md:text-sm transition-all duration-200"
            onClick={handleDelete}
          >
            선택 항목 삭제
          </button>
        </div>
      ) : (
        <div className="bg-[#1A2234] rounded-lg p-3 md:p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-[#232b3d] text-white placeholder-gray-400 rounded-standard py-1 md:py-1.5 pl-8 pr-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#cba967]"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
            </div>
            
            <button
              className="bg-[#cba967] hover:bg-[#b69757] text-black py-1 md:py-1.5 px-2 md:px-3 rounded-standard text-xs md:text-sm transition-all duration-200 flex items-center space-x-1"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>새 프로젝트</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 프로젝트 테이블 */}
      <div className="bg-[#1A2234] rounded-lg shadow-md overflow-hidden">
        <ProjectsTable 
          projects={filteredProjects.map(p => ({
            id: p.id,
            title: p.title || '',
            visibility: p.visibility,
            created_at: p.created_at,
            date: p.date,
            image_url: p.image_url,
            client: p.client,
          }))} 
          locale={locale}
          onSelectionChange={handleSelectionChange}
          selectedIds={selectedItems}
        />
      </div>

      {/* 프로젝트 생성 모달 */}
      <ProjectCreateModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        locale={locale}
      />
    </div>
  );
} 