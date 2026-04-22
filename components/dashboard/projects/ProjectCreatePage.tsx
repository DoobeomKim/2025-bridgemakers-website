'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createProject, getAllTags, createTag, linkTagsToProject } from '@/lib/projects';
import { Locale } from '@/lib/i18n';
import { useAuth } from '@/components/auth/AuthContext';
import { UserRole } from '@/types/supabase';
import ProjectForm, { ProjectFormData } from './ProjectForm';
import koMessages from '@/messages/ko/dashboard.json';
import enMessages from '@/messages/en/dashboard.json';

interface ProjectCreatePageProps {
  locale: Locale;
}

export default function ProjectCreatePage({ locale }: ProjectCreatePageProps) {
  const router = useRouter();
  const { userProfile, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const t = locale === 'ko' ? (koMessages as any).projectForm : (enMessages as any).projectForm;

  const handleBack = () => {
    router.push(`/${locale}/dashboard/projects`);
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

    const result = await createProject({
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
    });
    if (!result.success || !result.data) throw new Error(result.error || '프로젝트 생성 실패');

    if (data.gallery_images.length > 0) {
      const { error: imgError } = await supabase
        .from('project_images')
        .insert(
          data.gallery_images.map((url, index) => ({
            project_id: result.data.id,
            image_url: url,
            sort_order: index,
          }))
        );
      if (imgError) console.error('갤러리 이미지 저장 실패:', imgError);
    }

    if (tagIds.length > 0) {
      await linkTagsToProject(result.data.id, tagIds);
    }

    router.push(`/${locale}/dashboard/projects`);
  };

  if (isLoading) {
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
          {t?.createTitle ?? '새 프로젝트 만들기'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
        <ProjectForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={handleBack}
          locale={locale}
          translations={t}
        />
      </div>
    </div>
  );
}
