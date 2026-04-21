'use client';

import { useState, useRef, useEffect } from 'react';
import type * as React from 'react';
import { XMarkIcon, PhotoIcon, EyeIcon, EyeSlashIcon, ChevronUpDownIcon, PlusIcon, LanguageIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { createProject, getAllTags, createTag, linkTagsToProject } from '@/lib/projects';
import { generateSlug } from '@/lib/utils';
import { uploadImageToStorage, resizeImage } from '@/lib/imageUtils';
import { Locale } from '@/lib/i18n';
import { Combobox } from '@headlessui/react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ProjectTag } from '@/lib/database.types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableGalleryImage from './DraggableGalleryImage';
import GalleryDropZone from './GalleryDropZone';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locale: Locale;
}

interface GalleryImage {
  file: File | null;
  preview: string;
  id?: string;
}

// 기본 카테고리 목록
const defaultCategories = [
  { id: 'web', name: '웹사이트' },
  { id: 'app', name: '모바일 앱' },
  { id: 'branding', name: '브랜딩' },
  { id: 'marketing', name: '마케팅' },
  { id: 'consulting', name: '컨설팅' },
  { id: 'other', name: '기타' }
];

// 기본 산업 목록
const defaultIndustries = [
  { id: 'technology', name: '기술' },
  { id: 'finance', name: '금융' },
  { id: 'healthcare', name: '의료' },
  { id: 'education', name: '교육' },
  { id: 'retail', name: '소매' },
  { id: 'manufacturing', name: '제조업' },
  { id: 'other', name: '기타' }
];

export default function ProjectCreateModal({ isOpen, onClose, onSuccess, locale }: ProjectCreateModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailDropAreaRef = useRef<HTMLDivElement>(null);

  // ESC 키 이벤트 핸들러 추가
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 폼 상태
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    client: '',
    country: '',
    industry: '',
    videoUrl: '',
    isPublic: true
  });

  // 영어 폼 상태 (번역용)
  const [englishForm, setEnglishForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    client: '',
    country: '',
    industry: ''
  });

  // 번역 관련 상태
  const [translating, setTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<'pending' | 'completed' | 'error'>('pending');
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [apiUsage, setApiUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  // 이미지 상태
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 태그 관련 상태
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<ProjectTag[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // 슬러그 관련 상태
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // 카테고리/산업 검색 상태
  const [categoryQuery, setCategoryQuery] = useState('');
  const [industryQuery, setIndustryQuery] = useState('');

  // DeepL API 사용량 확인
  const checkApiUsage = async () => {
    try {
      const response = await fetch('/api/translate');
      if (response.ok) {
        const data = await response.json();
        // usage 객체가 올바른 구조인지 확인
        if (data.usage && typeof data.usage.used === 'number' && typeof data.usage.limit === 'number') {
          setApiUsage({
            used: data.usage.used,
            limit: data.usage.limit,
            remaining: data.usage.limit - data.usage.used
          });
        } else {
          console.warn('API 사용량 데이터 구조가 올바르지 않습니다:', data.usage);
          setApiUsage(null);
        }
      } else {
        console.warn('API 사용량 조회 실패:', response.status);
        setApiUsage(null);
      }
    } catch (error) {
      console.error('API 사용량 확인 실패:', error);
      setApiUsage(null);
    }
  };

  // 모달이 열릴 때 API 사용량 확인
  useEffect(() => {
    if (isOpen) {
      checkApiUsage();
    }
  }, [isOpen]);

  // 자동 번역 함수
  const handleAutoTranslate = async () => {
    if (!form.title && !form.description && !form.content) {
      setTranslationError('번역할 내용이 없습니다.');
      return;
    }

    setTranslating(true);
    setTranslationError(null);

    try {
      const fieldsToTranslate = [
        { field: 'title', text: form.title },
        { field: 'description', text: form.description },
        { field: 'content', text: form.content },
        { field: 'category', text: form.category },
        { field: 'client', text: form.client },
        { field: 'country', text: form.country },
        { field: 'industry', text: form.industry }
      ];

      const translations: any = {};

      for (const { field, text } of fieldsToTranslate) {
        if (text && text.trim()) {
          try {
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: text,
                targetLang: 'EN',
                sourceLang: 'KO'
              }),
            });

            if (response.ok) {
              const data = await response.json();
              translations[field] = data.translated;
            } else {
              const errorData = await response.json();
              throw new Error(errorData.error || '번역 실패');
            }
          } catch (error) {
            console.error(`${field} 번역 실패:`, error);
            translations[field] = text; // 번역 실패 시 원본 텍스트 사용
          }
        }
      }

      setEnglishForm(prev => ({
        ...prev,
        ...translations
      }));

      setTranslationStatus('completed');
      setApiUsage(prev => prev ? { ...prev, used: prev.used + Object.values(translations).join(' ').length } : null);

    } catch (error: any) {
      console.error('번역 중 오류:', error);
      setTranslationError(error.message || '번역 중 오류가 발생했습니다.');
      setTranslationStatus('error');
    } finally {
      setTranslating(false);
    }
  };

  // 영어 폼 변경 핸들러
  const handleEnglishFormChange = (field: string, value: string) => {
    setEnglishForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // DeepL 번역 후 슬러그 생성
  const generateSlugFromTitle = async (title: string) => {
    if (!title.trim()) return;
    setSlugLoading(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title, targetLang: 'EN', sourceLang: 'KO' }),
      });
      const data = response.ok ? await response.json() : null;
      const translatedTitle = data?.translated || title;
      setForm(prev => ({ ...prev, slug: generateSlug({ title: translatedTitle }) }));
    } catch {
      setForm(prev => ({ ...prev, slug: generateSlug({ title: prev.title }) }));
    } finally {
      setSlugLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTitleBlur = () => {
    if (!slugManuallyEdited && form.title) {
      generateSlugFromTitle(form.title);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setForm(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleRegenerateSlug = () => {
    if (!form.title) return;
    setSlugManuallyEdited(false);
    generateSlugFromTitle(form.title);
  };

  // 공개 설정 변경 핸들러
  const handleVisibilityChange = (value: 'public' | 'private') => {
    setForm(prev => ({ ...prev, isPublic: value === 'public' }));
  };



  // 썸네일 업로드 핸들러
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // 비디오 URL 변경 핸들러
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, videoUrl: e.target.value }));
  };

  // 백드롭 클릭 핸들러
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };



  // 썸네일 드래그 앤 드롭 핸들러들
  const handleThumbnailDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbnailDragging(true);
  };

  const handleThumbnailDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleThumbnailDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const root = thumbnailDropAreaRef.current;
    if (!root) return setIsThumbnailDragging(false);

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && root.contains(el)) return; // 아직 영역 안
    setIsThumbnailDragging(false);
  };

  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbnailDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };



  // 썸네일 삭제 핸들러
  const handleRemoveThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  // 태그 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await getAllTags();
        // tagsData가 배열인지 확인
        if (Array.isArray(tagsData)) {
          setTags(tagsData);
    } else {
          console.warn('태그 데이터가 배열이 아닙니다:', tagsData);
          setTags([]);
        }
      } catch (error) {
        console.error('태그 로드 실패:', error);
        setTags([]); // 에러 발생 시 빈 배열로 설정
      }
    };

    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  // 새 태그 생성
  const handleCreateTag = async () => {
    if (!tagQuery.trim() || isCreatingTag) return;

    setIsCreatingTag(true);
    try {
      const newTag = await createTag(tagQuery.trim());
      setTags(prev => [...prev, newTag]);
      setSelectedTags(prev => [...prev, newTag]);
      setTagQuery('');
    } catch (error) {
      console.error('태그 생성 실패:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  // 태그 선택/해제
  const handleTagToggle = (tag: ProjectTag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 이미지 업로드
      const uploadedImages: string[] = [];
      for (const image of images) {
        if (image.file) {
          const resizedImage = await resizeImage(image.file, 1200, 1200);
          const imageUrl = await uploadImageToStorage(resizedImage, 'projects');
          uploadedImages.push(imageUrl);
        }
      }

      // 썸네일 업로드
      let thumbnailUrl = '';
      if (thumbnail) {
        const resizedThumbnail = await resizeImage(thumbnail, 400, 400);
        thumbnailUrl = await uploadImageToStorage(resizedThumbnail, 'projects');
      }

      // 프로젝트 생성
      const projectData = {
        ...form,
        slug: form.slug || generateSlug({ title: form.title }),
        images: uploadedImages,
        thumbnail: thumbnailUrl,
        // 영어 번역 데이터 추가
        title_en: englishForm.title || null,
        description_en: englishForm.description || null,
        content_en: englishForm.content || null,
        category_en: englishForm.category || null,
        client_en: englishForm.client || null,
        country_en: englishForm.country || null,
        industry_en: englishForm.industry || null,
        translation_status: translationStatus
      };

      const project = await createProject(projectData);

      // 태그 연결
      if (selectedTags.length > 0) {
        await linkTagsToProject(project.id, selectedTags.map(tag => tag.id));
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (value: string) => {
    setForm(prev => ({
      ...prev,
      category: value
    }));
  };

  // 산업 선택 핸들러
  const handleIndustrySelect = (value: string) => {
    setForm(prev => ({
      ...prev,
      industry: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        {/* 모달 컨테이너 */}
        <div 
          ref={modalRef}
          className="relative bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">새 프로젝트 생성</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* DeepL API 사용량 표시 */}
          {apiUsage && apiUsage.used !== undefined && apiUsage.limit !== undefined && (
            <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400">
                  📡 DeepL API 사용량: {apiUsage.used.toLocaleString()} / {apiUsage.limit.toLocaleString()} 문자
                </span>
                <span className={`font-medium ${apiUsage.remaining < 10000 ? 'text-red-400' : 'text-blue-400'}`}>
                  남은 사용량: {apiUsage.remaining?.toLocaleString() || '0'} 문자
                </span>
                    </div>
                  </div>
                )}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">기본 정보</h3>
                
                {/* 프로젝트 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    프로젝트 제목 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    onBlur={handleTitleBlur}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="프로젝트 제목을 입력하세요"
                    required
                  />
                </div>

                {/* 슬러그 */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
                    URL 슬러그
                    <span className="ml-2 text-xs text-gray-500">제목 입력 후 포커스 아웃 시 자동 생성</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        id="slug"
                        value={form.slug}
                        onChange={handleSlugChange}
                        disabled={slugLoading}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm disabled:opacity-50"
                        placeholder="제목을 입력하면 자동으로 생성됩니다"
                      />
                      {slugLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <ArrowPathIcon className="h-4 w-4 text-amber-500 animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateSlug}
                      disabled={slugLoading || !form.title}
                      title="슬러그 재생성"
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {slugManuallyEdited && (
                    <p className="mt-1 text-xs text-amber-400">수동 편집됨 — 재생성 버튼을 눌러 다시 자동 생성할 수 있습니다</p>
                  )}
                </div>

                {/* 프로젝트 설명 */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    프로젝트 설명 *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                    required
                  />
                </div>

                {/* 프로젝트 내용 */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                    프로젝트 내용
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="프로젝트에 대한 자세한 내용을 입력하세요"
                  />
                    </div>
                </div>

              {/* 클라이언트 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">클라이언트 정보</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 클라이언트명 */}
                <div>
                    <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-1">
                      클라이언트명
                  </label>
                  <input
                      type="text"
                      id="client"
                      name="client"
                      value={form.client}
                    onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="클라이언트명을 입력하세요"
                  />
                </div>

                  {/* 국가 */}
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                    국가
                  </label>
                  <input
                    type="text"
                      id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="국가를 입력하세요"
                  />
                  </div>
                </div>
                </div>

              {/* 카테고리 및 산업 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">분류</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 카테고리 */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      카테고리
                  </label>
                    <Combobox value={form.category} onChange={handleCategorySelect}>
                    <div className="relative">
                      <Combobox.Input
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          displayValue={(value) => defaultCategories.find(cat => cat.id === value)?.name || value}
                          onChange={(e) => setCategoryQuery(e.target.value)}
                          placeholder="카테고리를 선택하세요"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                      </Combobox.Button>
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-gray-600 ring-opacity-5 focus:outline-none">
                          {defaultCategories
                            .filter(category => 
                              category.name.toLowerCase().includes(categoryQuery.toLowerCase())
                            )
                            .map((category) => (
                              <Combobox.Option
                                key={category.id}
                                value={category.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-amber-600 text-white' : 'text-gray-300'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {category.name}
                                    </span>
                                    {selected && (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500">
                                        ✓
                                      </span>
                                    )}
                                  </>
                                )}
                              </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </div>
                    </Combobox>
                  </div>

                  {/* 산업 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      산업
                    </label>
                    <Combobox value={form.industry} onChange={handleIndustrySelect}>
                      <div className="relative">
                        <Combobox.Input
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          displayValue={(value) => defaultIndustries.find(ind => ind.id === value)?.name || value}
                          onChange={(e) => setIndustryQuery(e.target.value)}
                          placeholder="산업을 선택하세요"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                        </Combobox.Button>
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-gray-600 ring-opacity-5 focus:outline-none">
                          {defaultIndustries
                            .filter(industry => 
                              industry.name.toLowerCase().includes(industryQuery.toLowerCase())
                            )
                            .map((industry) => (
                        <Combobox.Option
                          key={industry.id}
                                value={industry.id}
                          className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-amber-600 text-white' : 'text-gray-300'
                            }`
                          }
                        >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {industry.name}
                                    </span>
                                    {selected && (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500">
                                        ✓
                                      </span>
                                    )}
                                  </>
                                )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                      </div>
                  </Combobox>
                  </div>
                </div>
              </div>

              {/* 자동 번역 섹션 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">🌐 다국어 지원</h3>
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={translating || !form.title}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {translating ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        번역 중...
                      </>
                    ) : (
                      <>
                        <LanguageIcon className="h-4 w-4" />
                        영어로 AI 번역하기
                      </>
                    )}
                  </button>
                </div>

                {/* 번역 상태 표시 */}
                {translationError && (
                  <div className="p-3 bg-red-900 border border-red-700 rounded-md">
                    <p className="text-sm text-red-400">❌ {translationError}</p>
                  </div>
                )}

                {translationStatus === 'completed' && (
                  <div className="p-3 bg-green-900 border border-green-700 rounded-md">
                    <p className="text-sm text-green-400">✅ 번역이 완료되었습니다. 아래에서 수정할 수 있습니다.</p>
                  </div>
                )}

                {/* 영어 번역 입력 필드들 */}
                {translationStatus === 'completed' && (
                  <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-md font-medium text-white flex items-center gap-2">
                      🇺🇸 영어 번역
                    </h4>
                    
                    {/* 영어 제목 */}
              <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        영어 제목
                      </label>
                      <input
                        type="text"
                        value={englishForm.title}
                        onChange={(e) => handleEnglishFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="English title"
                      />
                    </div>

                    {/* 영어 설명 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        영어 설명
                </label>
                <textarea
                        value={englishForm.description}
                        onChange={(e) => handleEnglishFormChange('description', e.target.value)}
                  rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="English description"
                />
              </div>

                    {/* 영어 내용 */}
              <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        영어 내용
                </label>
                <textarea
                        value={englishForm.content}
                        onChange={(e) => handleEnglishFormChange('content', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="English content"
                />
              </div>

                    {/* 영어 클라이언트 정보 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 클라이언트명
                </label>
                <input
                          type="text"
                          value={englishForm.client}
                          onChange={(e) => handleEnglishFormChange('client', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="English client name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 국가
                        </label>
                        <input
                          type="text"
                          value={englishForm.country}
                          onChange={(e) => handleEnglishFormChange('country', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="English country"
                        />
                      </div>
              </div>

                    {/* 영어 카테고리 및 산업 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 카테고리
                        </label>
                        <input
                          type="text"
                          value={englishForm.category}
                          onChange={(e) => handleEnglishFormChange('category', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="English category"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 산업
                        </label>
                        <input
                          type="text"
                          value={englishForm.industry}
                          onChange={(e) => handleEnglishFormChange('industry', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="English industry"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 미디어 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">미디어</h3>
                
                {/* 썸네일 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    썸네일 이미지
                </label>
                <div
                  ref={thumbnailDropAreaRef}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isThumbnailDragging
                        ? 'border-amber-500 bg-amber-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleThumbnailDragEnter}
                  onDragOver={handleThumbnailDragOver}
                  onDragLeave={handleThumbnailDragLeave}
                  onDrop={handleThumbnailDrop}
                >
                  {thumbnailPreview ? (
                    <div className="relative">
                        <Image
                        src={thumbnailPreview}
                          alt="썸네일 미리보기"
                          width={200}
                          height={200}
                          className="mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                          onClick={handleRemoveThumbnail}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                      <div>
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-300">
                          썸네일 이미지를 드래그하거나 클릭하여 업로드하세요
                        </p>
                  <input
                    ref={thumbnailFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                        <button
                          type="button"
                          onClick={() => thumbnailFileInputRef.current?.click()}
                          className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                        >
                          파일 선택
                        </button>
                      </div>
                    )}
                </div>
              </div>

                {/* 갤러리 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    갤러리 이미지
                </label>
                  <DndProvider backend={HTML5Backend}>
                <GalleryDropZone
                      images={images}
                      onImagesChange={setImages}
                      onError={(message) => console.error(message)}
                    />
                  </DndProvider>
              </div>

                {/* 비디오 URL */}
              <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    비디오 URL (선택사항)
                </label>
                  <input
                    type="url"
                    id="videoUrl"
                    name="videoUrl"
                    value={form.videoUrl}
                    onChange={handleVideoUrlChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* 태그 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">태그</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    태그 검색 및 선택
                  </label>
                  <div className="flex gap-2">
                    <Combobox value={tagQuery} onChange={setTagQuery}>
                      <div className="relative flex-1">
                        <Combobox.Input
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="태그를 검색하거나 새로 생성하세요"
                          onChange={(e) => setTagQuery(e.target.value)}
                        />
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-gray-600 ring-opacity-5 focus:outline-none">
                          {tags && Array.isArray(tags) && tags
                            .filter(tag => 
                              tag.name.toLowerCase().includes(tagQuery.toLowerCase())
                            )
                            .map((tag) => (
                              <Combobox.Option
                          key={tag.id}
                                value={tag.name}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-amber-600 text-white' : 'text-gray-300'
                                  }`
                                }
                                onClick={() => handleTagToggle(tag)}
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {tag.name}
                        </span>
                                    {selectedTags.some(t => t.id === tag.id) && (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500">
                                        ✓
                                      </span>
                                    )}
                                  </>
                                )}
                              </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </div>
                    </Combobox>
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={!tagQuery.trim() || isCreatingTag}
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isCreatingTag ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                      {isCreatingTag ? '생성 중...' : '새 태그'}
                    </button>
                  </div>
                  </div>

                {/* 선택된 태그 목록 */}
                {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                              key={tag.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-amber-900 text-amber-200 rounded-full text-sm"
                            >
                              {tag.name}
                        <button
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className="text-amber-400 hover:text-amber-200"
                        >
                          <XMarkIcon className="h-3 w-3" />
                            </button>
                      </span>
                          ))}
                    </div>
                  )}
              </div>

              {/* 공개 설정 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">공개 설정</h3>
                
                <div className="flex gap-4">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={form.isPublic}
                      onChange={() => handleVisibilityChange('public')}
                      className="mr-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="flex items-center gap-2">
                      <EyeIcon className="h-4 w-4" />
                      공개
                    </span>
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={!form.isPublic}
                      onChange={() => handleVisibilityChange('private')}
                      className="mr-2 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="flex items-center gap-2">
                      <EyeSlashIcon className="h-4 w-4" />
                      비공개
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    프로젝트 생성
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 