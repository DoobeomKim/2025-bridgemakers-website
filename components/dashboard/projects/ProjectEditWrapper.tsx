'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { updateProject, getAllTags, createTag } from '@/lib/projects';
import { Locale } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthContext';
import { UserRole } from '@/types/supabase';
import ProjectForm, { ProjectFormData } from './ProjectForm';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useEffect } from 'react';
import koMessages from '@/messages/ko/dashboard.json';
import enMessages from '@/messages/en/dashboard.json';

interface ProjectEditWrapperProps {
  locale: Locale;
  projectId: string;
}

interface ProjectWithDetails {
  id: string;
  title?: string;
  title_en?: string;
  slug?: string;
  description?: string;
  description_en?: string;
  content?: string;
  content_en?: string;
  category?: string;
  category_en?: string;
  industry?: string;
  industry_en?: string;
  client?: string;
  country?: string;
  date?: string;
  service?: string;
  image_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  visibility?: 'public' | 'private';
  is_featured?: boolean;
  translation_status?: string;
  project_tag_relations?: { project_tags?: { id: string; name: string } }[];
  project_images?: { id: string; image_url: string; sort_order: number }[];
}

function mapProjectToFormData(project: ProjectWithDetails): Partial<ProjectFormData> {
  return {
    title: project.title || '',
    title_en: project.title_en || '',
    slug: project.slug || '',
    description: project.description || '',
    description_en: project.description_en || '',
    content: project.content || '',
    content_en: project.content_en || '',
    category: project.category || '',
    category_en: project.category_en || '',
    industry: project.industry || '',
    industry_en: project.industry_en || '',
    client: project.client || '',
    country: project.country || '',
    date: project.date || '',
    service: project.service || '',
    image_url: project.image_url || '',
    gallery_images: project.project_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map(img => img.image_url) || [],
    video_url: project.video_url || '',
    video_thumbnail_url: project.video_thumbnail_url || '',
    visibility: project.visibility || 'private',
    is_featured: project.is_featured || false,
    tags: project.project_tag_relations
      ?.map((r) => r.project_tags?.name).filter((n): n is string => Boolean(n)) || [],
    translation_status: (project.translation_status as any) || 'pending',
  };
}

export default function ProjectEditWrapper({ locale, projectId }: ProjectEditWrapperProps) {
  const router = useRouter();
  const { userProfile, isLoading: authLoading } = useAuth();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const t = locale === 'ko' ? (koMessages as any).projectForm : (enMessages as any).projectForm;

  const handleBack = () => {
    router.push(`/${locale}/dashboard/projects`);
  };

  useEffect(() => {
    if (!authLoading && userProfile?.user_level === UserRole.ADMIN) {
      loadProject();
    }
  }, [authLoading, userProfile]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`*, project_tag_relations(project_tags(id, name)), project_images(id, image_url, sort_order)`)
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;
      setProject(data);
    } catch (err: any) {
      console.error('프로젝트 로드 실패:', err);
      setError(err.message || '프로젝트를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    setError(null);

    const allTagsResult = await getAllTags();
    const allTags = allTagsResult.data;
    const tagIds = await Promise.all(
      data.tags.map(async (name) => {
        const existing = allTags.find(t => t.name === name);
        if (existing) return existing.id;
        const result = await createTag(name);
        if (!result.success || !result.data) throw new Error(`태그 생성 실패: ${name}`);
        return result.data.id;
      })
    );

    const updated = await updateProject(projectId, {
      title: data.title,
      title_en: data.title_en || null,
      slug: data.slug,
      description: data.description,
      description_en: data.description_en || null,
      content: data.content,
      content_en: data.content_en || null,
      category: data.category,
      category_en: data.category_en || null,
      industry: data.industry,
      industry_en: data.industry_en || null,
      client: data.client,
      country: data.country,
      date: data.date,
      service: data.service,
      image_url: data.image_url,
      video_url: data.video_url || null,
      video_thumbnail_url: data.video_thumbnail_url || null,
      visibility: data.visibility,
      is_featured: data.is_featured,
      translation_status: data.translation_status,
      tags: tagIds,
    });
    if (!updated) throw new Error('프로젝트 수정 실패');

    await supabase.from('project_images').delete().eq('project_id', projectId);

    if (data.gallery_images.length > 0) {
      const { error: imgError } = await supabase
        .from('project_images')
        .insert(
          data.gallery_images.map((url, index) => ({
            project_id: projectId,
            image_url: url,
            sort_order: index,
          }))
        );
      if (imgError) console.error('갤러리 이미지 저장 실패:', imgError);
    }

    router.push(`/${locale}/dashboard/projects`);
  };

  if (authLoading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  if (!userProfile || userProfile.user_level !== UserRole.ADMIN) {
    return (
      <div className="text-red-500 p-8 text-center text-lg font-bold">
        관리자만 접근할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t?.backToList ?? '목록으로'}
        </button>
        <h1 className="text-xl font-semibold text-white">
          {t?.editTitle ?? '프로젝트 수정'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <ProjectForm
            mode="edit"
            initialData={project ? mapProjectToFormData(project) : undefined}
            onSubmit={handleSubmit}
            onCancel={handleBack}
            locale={locale}
            translations={t}
          />
        )}
      </div>
    </div>
  );
}
