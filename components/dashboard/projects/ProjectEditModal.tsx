'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  XMarkIcon, 
  DocumentIcon, 
  PhotoIcon, 
  LanguageIcon, 
  ArrowPathIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';

import LoadingSpinner from '../../common/LoadingSpinner';

// 타입 정의
interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locale: string;
  projectId: string;
}

interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  client: string;
  date: string;
  country: string;
  industry: string;
  service: string;
  image_url: string;
  video_url?: string;
  video_thumbnail_url?: string;
  visibility: 'public' | 'private';
  is_featured: boolean;
  tags: string[];
  // 영어 번역 필드들
  title_en?: string;
  description_en?: string;
  content_en?: string;
  category_en?: string;
  client_en?: string;
  country_en?: string;
  industry_en?: string;
  translation_status?: string;
}

interface ProjectWithDetails extends ProjectFormData {
  id: string;
  created_at: string;
  updated_at: string;
  project_images?: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
}

export default function ProjectEditModal({ isOpen, onClose, onSuccess, locale, projectId }: ProjectEditModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailDropAreaRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [form, setForm] = useState<ProjectFormData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    client: '',
    date: '',
    country: '',
    industry: '',
    service: '',
    image_url: '',
    video_url: '',
    video_thumbnail_url: '',
    visibility: 'public',
    is_featured: false,
    tags: []
  });

  // 영어 번역 관련 상태
  const [englishForm, setEnglishForm] = useState<{
    title_en: string;
    description_en: string;
    content_en: string;
    category_en: string;
    client_en: string;
    country_en: string;
    industry_en: string;
  }>({
    title_en: '',
    description_en: '',
    content_en: '',
    category_en: '',
    client_en: '',
    country_en: '',
    industry_en: ''
  });

  const [translating, setTranslating] = useState(false);
  const [translationStatus, setTranslationStatus] = useState<string>('pending');
  const [translationError, setTranslationError] = useState<string>('');
  const [apiUsage, setApiUsage] = useState<{ used: number; limit: number } | null>(null);

  // 이미지 관련 상태
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);

  // 태그 관련 상태
  const [tags, setTags] = useState<string[]>([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [industryQuery, setIndustryQuery] = useState('');

  const supabase = createClientComponentClient();

  // 프로젝트 데이터 로드
  useEffect(() => {
    if (isOpen && projectId) {
      loadProject();
    }
  }, [isOpen, projectId]);

  // 태그 로드
  useEffect(() => {
    loadTags();
  }, []);

  // API 사용량 체크
  useEffect(() => {
    checkApiUsage();
  }, []);

  const loadProject = async () => {
    try {
      setLoading(true);
      console.log('🔄 프로젝트 로드 중:', projectId);

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images(id, image_url, sort_order)
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('❌ 프로젝트 로드 실패:', error);
        throw error;
      }

      if (data) {
        console.log('✅ 프로젝트 로드 성공:', data);
        setProject(data);
        
        // 폼 데이터 설정
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          content: data.content || '',
          category: data.category || '',
          client: data.client || '',
          date: data.date || '',
          country: data.country || '',
          industry: data.industry || '',
          service: data.service || '',
          image_url: data.image_url || '',
          video_url: data.video_url || '',
          video_thumbnail_url: data.video_thumbnail_url || '',
          visibility: data.visibility || 'public',
          is_featured: data.is_featured || false,
          tags: data.tags || []
        });

        // 영어 번역 데이터 설정
        setEnglishForm({
          title_en: data.title_en || '',
          description_en: data.description_en || '',
          content_en: data.content_en || '',
          category_en: data.category_en || '',
          client_en: data.client_en || '',
          country_en: data.country_en || '',
          industry_en: data.industry_en || ''
        });

        setTranslationStatus(data.translation_status || 'pending');

        // 갤러리 이미지 설정 (추후 구현 예정)
        }
      } catch (error) {
      console.error('❌ 프로젝트 로드 중 오류:', error);
      } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('project_tags')
        .select('name')
        .order('name');

      if (error) {
        console.error('❌ 태그 로드 실패:', error);
        setTags([]);
        return;
      }

      const tagNames = data?.map((tag: any) => tag.name) || [];
      setTags(tagNames);
    } catch (error) {
      console.error('❌ 태그 로드 중 오류:', error);
      setTags([]);
    }
  };

  const checkApiUsage = async () => {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_usage' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.usage && typeof data.usage.used === 'number' && typeof data.usage.limit === 'number') {
          setApiUsage(data.usage);
    } else {
          setApiUsage(null);
        }
      } else {
        setApiUsage(null);
      }
    } catch (error) {
      console.error('❌ API 사용량 확인 실패:', error);
      setApiUsage(null);
    }
  };

  const handleAutoTranslate = async () => {
    setTranslating(true);
    setTranslationError('');

    try {
      const fieldsToTranslate = [
        { key: 'title_en', value: form.title },
        { key: 'description_en', value: form.description },
        { key: 'content_en', value: form.content },
        { key: 'category_en', value: form.category },
        { key: 'client_en', value: form.client },
        { key: 'country_en', value: form.country },
        { key: 'industry_en', value: form.industry }
      ];

      const translations: any = {};

      for (const field of fieldsToTranslate) {
        if (field.value && field.value.trim()) {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: field.value,
              target_lang: 'EN'
            })
          });

          if (response.ok) {
            const data = await response.json();
            translations[field.key] = data.translation;
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || '번역 실패');
          }
        }
      }

      setEnglishForm(prev => ({
        ...prev,
        ...translations
      }));

      setTranslationStatus('auto_translated');
      await checkApiUsage();

    } catch (error: any) {
      console.error('❌ 자동 번역 실패:', error);
      setTranslationError(error.message || '번역 중 오류가 발생했습니다.');
    } finally {
      setTranslating(false);
    }
  };

  const handleFormChange = (field: keyof ProjectFormData, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // 슬러그 자동 생성
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setForm(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleEnglishFormChange = (field: keyof typeof englishForm, value: string) => {
    setEnglishForm(prev => ({
      ...prev,
      [field]: value
    }));

    if (translationStatus === 'auto_translated' || translationStatus === 'pending') {
      setTranslationStatus('manual_edited');
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setForm(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleError = (message: string) => {
    console.error('❌ 에러:', message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('🔄 프로젝트 업데이트 중...');

      // 프로젝트 데이터 업데이트
      const updateData = {
        ...form,
        ...englishForm,
        translation_status: translationStatus,
        updated_at: new Date().toISOString()
      };

      const { error: projectError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (projectError) {
        console.error('❌ 프로젝트 업데이트 실패:', projectError);
        throw projectError;
      }

            // 갤러리 이미지 처리는 추후 구현 예정

      console.log('✅ 프로젝트 업데이트 완료');
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('❌ 프로젝트 업데이트 실패:', error);
      alert(`프로젝트 업데이트에 실패했습니다: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">프로젝트 수정</h2>
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          disabled={saving}
        >
          <XMarkIcon className="w-5 h-5" />
          목록으로
        </button>
      </div>

      {/* DeepL API 사용량 표시 */}
      {apiUsage && (
        <div className="px-6 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-400">
              📡 DeepL API 사용량: {apiUsage.used.toLocaleString()} / {apiUsage.limit.toLocaleString()} 문자
            </span>
            <span className="text-blue-400 font-medium">
              남은 사용량: {(apiUsage.limit - apiUsage.used).toLocaleString()} 문자
            </span>
          </div>
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">기본 정보</h3>
                
                {/* 프로젝트 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    프로젝트 제목 *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="프로젝트 제목을 입력하세요"
                    required
                  />
                </div>

                {/* 프로젝트 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    프로젝트 설명 *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                    required
                  />
                </div>

                {/* 프로젝트 내용 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    프로젝트 내용
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      클라이언트명
                  </label>
                  <input
                    type="text"
                    value={form.client}
                      onChange={(e) => handleFormChange('client', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="클라이언트명을 입력하세요"
                  />
                </div>

                  {/* 국가 */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      국가
                    </label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
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
                  <Combobox
                    value={form.category}
                      onChange={(value) => handleFormChange('category', value)}
                  >
                    <div className="relative">
                        <Combobox.Input
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          displayValue={(value: string) => value || ''}
                          onChange={(e) => setCategoryQuery(e.target.value)}
                          placeholder="카테고리를 선택하세요"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </Combobox.Button>
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-gray-600 ring-opacity-5 focus:outline-none">
                          {['웹사이트', '모바일앱', '브랜딩', 'UI/UX', '개발']
                            .filter(category => 
                              category.toLowerCase().includes(categoryQuery.toLowerCase())
                            )
                            .map((category) => (
                          <Combobox.Option
                                key={category}
                                value={category}
                            className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-amber-600 text-white' : 'text-gray-300'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {category}
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
                  <Combobox
                    value={form.industry}
                      onChange={(value) => handleFormChange('industry', value)}
                  >
                    <div className="relative">
                        <Combobox.Input
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          displayValue={(value: string) => value || ''}
                          onChange={(e) => setIndustryQuery(e.target.value)}
                          placeholder="산업을 선택하세요"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        </Combobox.Button>
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-gray-600 ring-opacity-5 focus:outline-none">
                          {['의료', '교육', '금융', '커머스', '제조업', '서비스업']
                            .filter(industry => 
                              industry.toLowerCase().includes(industryQuery.toLowerCase())
                            )
                            .map((industry) => (
                          <Combobox.Option
                                key={industry}
                                value={industry}
                            className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-amber-600 text-white' : 'text-gray-300'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {industry}
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

                {/* 추가 필드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      프로젝트 날짜
                  </label>
                  <input
                      type="date"
                      value={form.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      서비스 유형
                  </label>
                    <input
                      type="text"
                      value={form.service}
                      onChange={(e) => handleFormChange('service', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="서비스 유형을 입력하세요"
                    />
                  </div>
              </div>

                {/* 슬러그 */}
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    URL 슬러그
                </label>
                <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleFormChange('slug', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="url-slug"
                />
              </div>

                {/* 공개 설정 및 추천 설정 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      공개 설정
                </label>
                    <select
                      value={form.visibility}
                      onChange={(e) => handleFormChange('visibility', e.target.value as 'public' | 'private')}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="public">공개</option>
                      <option value="private">비공개</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={form.is_featured}
                      onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-600 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-300">
                      추천 프로젝트로 설정
                    </label>
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

                {translationStatus === 'auto_translated' && (
                  <div className="p-3 bg-green-900 border border-green-700 rounded-md">
                    <p className="text-sm text-green-400">✅ 번역이 완료되었습니다. 아래에서 수정할 수 있습니다.</p>
                    </div>
                  )}

                {/* 영어 번역 입력 필드들 */}
                {(translationStatus === 'auto_translated' || translationStatus === 'manual_edited') && (
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
                        value={englishForm.title_en}
                        onChange={(e) => handleEnglishFormChange('title_en', e.target.value)}
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
                        value={englishForm.description_en}
                        onChange={(e) => handleEnglishFormChange('description_en', e.target.value)}
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
                        value={englishForm.content_en}
                        onChange={(e) => handleEnglishFormChange('content_en', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="English content"
                      />
              </div>

                    {/* 기타 영어 필드들 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 클라이언트명
                </label>
                        <input
                          type="text"
                          value={englishForm.client_en}
                          onChange={(e) => handleEnglishFormChange('client_en', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="English client name"
                        />
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 국가명
                        </label>
                    <input
                      type="text"
                          value={englishForm.country_en}
                          onChange={(e) => handleEnglishFormChange('country_en', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="English country name"
                        />
                  </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          영어 카테고리
                        </label>
                        <input
                          type="text"
                          value={englishForm.category_en}
                          onChange={(e) => handleEnglishFormChange('category_en', e.target.value)}
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
                          value={englishForm.industry_en}
                          onChange={(e) => handleEnglishFormChange('industry_en', e.target.value)}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    대표 이미지 URL
                </label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) => handleFormChange('image_url', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    비디오 URL (선택사항)
                  </label>
                <input
                    type="url"
                    value={form.video_url || ''}
                    onChange={(e) => handleFormChange('video_url', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/video.mp4"
                />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    비디오 썸네일 URL (선택사항)
                  </label>
                  <input
                    type="url"
                    value={form.video_thumbnail_url || ''}
                    onChange={(e) => handleFormChange('video_thumbnail_url', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                                {/* 갤러리 이미지 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    갤러리 이미지
                  </label>
                  <div className="text-gray-400 text-sm">
                    갤러리 이미지 관리는 추후 구현 예정입니다.
                  </div>
                </div>
            </div>



              {/* 액션 버튼 */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {saving ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                    </>
                ) : (
                    '프로젝트 업데이트'
                )}
              </button>
            </div>
            </div>
      </form>
    </div>
  );
}
