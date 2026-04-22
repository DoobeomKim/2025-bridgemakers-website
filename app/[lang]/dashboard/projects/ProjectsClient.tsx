"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects, deleteProjects, updateProjectsVisibility } from "@/lib/projects";
import { useAuth } from '@/components/auth/AuthContext';
import { Locale } from "@/lib/i18n";
import ProjectsTable from "@/components/dashboard/projects/ProjectsTable";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, PlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@/types/supabase';

interface ProjectsClientProps {
  locale: Locale;
  translations: Record<string, any>;
}

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
  visibility: 'public' | 'private';
  image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  slug?: string;
  [key: string]: any;
}

export default function ProjectsClient({ locale, translations }: ProjectsClientProps) {
  const router = useRouter();
  const { userProfile, isLoading: userLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProjects = () => {
    if (userProfile?.user_level === UserRole.ADMIN) {
      getProjects().then(data => {
        const processedData = data.map((p: any) => ({
          ...p,
          client: p.client || '-',
          title: p.title || '-',
          country: p.country || '-',
          category: p.category || '-',
          tags: p.tags || [],
          visibility: p.visibility || 'private',
          image_url: p.image_url || null,
          created_at: p.created_at || new Date().toISOString(),
        }));
        setProjects(processedData);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadProjects();
  }, [userProfile]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredProjects = searchQuery.trim() === ''
    ? projects
    : projects.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  };


  const handleDelete = async () => {
    if (!selectedItems.length || isDeleting) return;
    if (!pendingDelete) {
      setPendingDelete(true);
      return;
    }
    setPendingDelete(false);
    setIsDeleting(true);
    setActionError(null);
    try {
      const result = await deleteProjects(selectedItems);
      if (result.success) {
        setSelectedItems([]);
        loadProjects();
      } else {
        setActionError(translations.projectList?.deleteError || 'Failed to delete projects.');
      }
    } catch (error) {
      console.error('프로젝트 삭제 오류:', error);
      setActionError(translations.projectList?.deleteError || 'Failed to delete projects.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVisibilityChange = async (visibility: 'public' | 'private') => {
    if (!selectedItems.length || isUpdatingVisibility) return;
    setIsUpdatingVisibility(true);
    setActionError(null);
    try {
      const result = await updateProjectsVisibility(selectedItems, visibility);
      if (result.success) {
        setSelectedItems([]);
        loadProjects();
        setShowVisibilityMenu(false);
      } else {
        setActionError(translations.projectList?.visibilityError || 'Failed to update visibility.');
      }
    } catch (error) {
      console.error('공개 설정 변경 오류:', error);
      setActionError(translations.projectList?.visibilityError || 'Failed to update visibility.');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  if (userLoading) return <div className="text-white p-8">{translations.projectList?.loading || 'Loading...'}</div>;
  if (userProfile?.user_level !== UserRole.ADMIN) {
    return <div className="text-red-500 p-8 text-center text-lg font-bold">{translations.projectList?.noPermission || 'No permission.'}</div>;
  }
  if (loading) return <div className="text-white p-8">{translations.projectList?.loading || 'Loading...'}</div>;

  return (
    <div className="space-y-4">
      {actionError && (
        <p className="text-red-500 text-sm mt-2">{actionError}</p>
      )}

      {selectedItems.length > 0 ? (
        <div className="bg-[#1A2234] rounded-lg p-3 md:p-4 flex flex-wrap gap-2 items-center">
          <span className="text-xs md:text-sm text-white">
            {selectedItems.length} {translations.projectList?.selected || 'selected'}
          </span>

          <div className="relative">
            <button
              className="bg-[#232b3d] hover:bg-[#2d374b] text-white py-1 md:py-1.5 px-2 md:px-3 rounded-standard text-xs md:text-sm transition-all duration-200 flex items-center space-x-1"
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            >
              <AdjustmentsHorizontalIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{translations.projectList?.visibilityChange || 'Change Visibility'}</span>
            </button>

            {showVisibilityMenu && (
              <div className="absolute top-full left-0 mt-1 w-32 md:w-40 bg-[#232b3d] rounded-standard shadow-lg border border-[#353f54] overflow-hidden z-10">
                <button
                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white hover:bg-[#2d374b] flex items-center space-x-1 md:space-x-2"
                  onClick={() => handleVisibilityChange('public')}
                >
                  <EyeIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>{translations.projectList?.makePublic || 'Make Public'}</span>
                </button>
                <button
                  className="w-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white hover:bg-[#2d374b] flex items-center space-x-1 md:space-x-2"
                  onClick={() => handleVisibilityChange('private')}
                >
                  <EyeSlashIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>{translations.projectList?.makePrivate || 'Make Private'}</span>
                </button>
              </div>
            )}
          </div>

          {pendingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400">
                {translations.projectList?.confirmDelete || 'Are you sure?'}
              </span>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-standard text-xs transition-all duration-200"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {translations.projectList?.confirmYes || 'Delete'}
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded-standard text-xs transition-all duration-200"
                onClick={() => setPendingDelete(false)}
              >
                {translations.projectList?.confirmNo || 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              className="bg-red-600 hover:bg-red-700 text-white py-1 md:py-1.5 px-2 md:px-3 rounded-standard text-xs md:text-sm transition-all duration-200"
              onClick={handleDelete}
            >
              {translations.projectList?.deleteSelected || 'Delete Selected'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#1A2234] rounded-lg p-3 md:p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={translations.projectList?.search || 'Search projects...'}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-[#232b3d] text-white placeholder-gray-400 rounded-standard py-1 md:py-1.5 pl-8 pr-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#cba967]"
              />
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
            </div>

            <button
              className="bg-[#cba967] hover:bg-[#b69757] text-black py-1 md:py-1.5 px-2 md:px-3 rounded-standard text-xs md:text-sm transition-all duration-200 flex items-center space-x-1"
              onClick={() => router.push(`/${locale}/dashboard/projects/new`)}
            >
              <PlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{translations.projectList?.newProject || 'New Project'}</span>
            </button>
          </div>
        </div>
      )}

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

    </div>
  );
}
