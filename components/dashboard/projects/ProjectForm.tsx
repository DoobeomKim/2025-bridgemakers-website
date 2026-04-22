'use client';

import { useState, useRef, useEffect } from 'react';
import type * as React from 'react';
import {
  ArrowPathIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  LanguageIcon,
  SparklesIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';
import { generateSlug } from '@/lib/utils';
import { uploadImageToStorage } from '@/lib/imageUtils';
import { getAllTags, createTag } from '@/lib/projects';
import type { ProjectTag } from '@/lib/database.types';
import GalleryDropZone from './GalleryDropZone';
import { supabase } from '@/lib/supabase';

export interface ProjectFormData {
  client: string;
  country: string;
  date: string;
  service: string;
  slug: string;
  visibility: 'public' | 'private';
  is_featured: boolean;
  image_url: string;
  gallery_images: string[];
  video_url: string;
  video_thumbnail_url: string;
  tags: string[];
  title: string;
  description: string;
  content: string;
  category: string;
  industry: string;
  title_en: string;
  description_en: string;
  content_en: string;
  category_en: string;
  industry_en: string;
  translation_status: 'pending' | 'translated' | 'reviewed';
}

interface GalleryImageItem {
  file: File | null;
  preview: string;
  id?: string;
}

interface ProjectFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  locale: Locale;
  translations: Record<string, any>;
}

function buildInitialForm(initialData?: Partial<ProjectFormData>): ProjectFormData {
  const today = new Date().toISOString().split('T')[0];
  const base: ProjectFormData = {
    client: '', country: '', date: today, service: '',
    slug: '', visibility: 'public', is_featured: false,
    image_url: '', gallery_images: [], video_url: '', video_thumbnail_url: '',
    tags: [], title: '', description: '', content: '', category: '', industry: '',
    title_en: '', description_en: '', content_en: '', category_en: '', industry_en: '',
    translation_status: 'pending',
  };
  if (!initialData) return base;
  return {
    ...base,
    ...initialData,
    date: initialData.date ? initialData.date.split('T')[0] : today,
    gallery_images: initialData.gallery_images ?? [],
    tags: initialData.tags ?? [],
    title_en: initialData.title_en ?? '',
    description_en: initialData.description_en ?? '',
    content_en: initialData.content_en ?? '',
    category_en: initialData.category_en ?? '',
    industry_en: initialData.industry_en ?? '',
    video_url: initialData.video_url ?? '',
    video_thumbnail_url: initialData.video_thumbnail_url ?? '',
    service: initialData.service ?? '',
  };
}

// Reusable suggestion combobox
function SuggestCombobox({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState('');
  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()) && o !== value)
    : options.filter(o => o !== value);

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <Combobox.Input
          className={`${className} pr-8`}
          displayValue={(v: string) => v}
          onChange={e => {
            onChange(e.target.value);
            setQuery(e.target.value);
          }}
          placeholder={placeholder}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon className="h-4 w-4 text-gray-500" />
        </Combobox.Button>
        <Combobox.Options className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md bg-gray-800 py-1 text-sm shadow-lg ring-1 ring-gray-600 focus:outline-none">
          {filtered.length === 0 ? null : filtered.map(opt => (
            <Combobox.Option
              key={opt}
              value={opt}
              className={({ active }) =>
                `cursor-pointer select-none py-2 px-3 ${active ? 'bg-amber-600 text-white' : 'text-gray-300'}`
              }
            >
              {opt}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}

export default function ProjectForm({
  mode, initialData, onSubmit, onCancel, locale, translations,
}: ProjectFormProps) {
  const t = translations;
  const [form, setForm] = useState<ProjectFormData>(() => buildInitialForm(initialData));

  // Thumbnail
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailDropAreaRef = useRef<HTMLDivElement>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.image_url ?? null);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);

  // Gallery
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>(() =>
    (initialData?.gallery_images ?? []).map(url => ({ file: null, preview: url }))
  );

  // Tags
  const [allTags, setAllTags] = useState<ProjectTag[]>([]);
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(initialData?.tags ?? []);
  const [tagQuery, setTagQuery] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagCreateError, setTagCreateError] = useState<string | null>(null);

  // DB suggestions for service / category / industry
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [categoryEnOptions, setCategoryEnOptions] = useState<string[]>([]);
  const [industryEnOptions, setIndustryEnOptions] = useState<string[]>([]);

  // Slug
  const [slugLoading, setSlugLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Translation
  const [translatingToEn, setTranslatingToEn] = useState(false);
  const [translatingToKo, setTranslatingToKo] = useState(false);
  const [translateEnError, setTranslateEnError] = useState<string | null>(null);
  const [translateKoError, setTranslateKoError] = useState<string | null>(null);
  const [apiUsage, setApiUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  // AI Polish
  const [polishingKo, setPolishingKo] = useState(false);
  const [polishingEn, setPolishingEn] = useState(false);
  const [polishKoError, setPolishKoError] = useState<string | null>(null);
  const [polishEnError, setPolishEnError] = useState<string | null>(null);

  // Submit
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    getAllTags().then(result => {
      if (result.success) setAllTags(result.data);
    });
    fetchApiUsage();
    fetchSuggestions();
  }, []);

  const fetchApiUsage = async () => {
    try {
      const res = await fetch('/api/translate');
      if (!res.ok) return;
      const data = await res.json();
      if (data.usage) {
        setApiUsage({
          used: data.usage.charactersUsed ?? data.usage.used ?? 0,
          limit: data.usage.characterLimit ?? data.usage.limit ?? 0,
          remaining: data.usage.remaining ?? 0,
        });
      }
    } catch { /* silent */ }
  };

  const fetchSuggestions = async () => {
    const unique = (arr: (string | null | undefined)[]) =>
      [...new Set(arr.filter((v): v is string => !!v && v.trim() !== ''))].sort();

    // 모든 컬럼 시도 (DB 마이그레이션 완료 후 전체 동작)
    const { data, error } = await supabase
      .from('projects')
      .select('service, category, industry, category_en, industry_en');

    if (!error && data) {
      setServiceOptions(unique(data.map((p: any) => p.service)));
      setCategoryOptions(unique(data.map((p: any) => p.category)));
      setIndustryOptions(unique(data.map((p: any) => p.industry)));
      setCategoryEnOptions(unique(data.map((p: any) => p.category_en)));
      setIndustryEnOptions(unique(data.map((p: any) => p.industry_en)));
      return;
    }

    // 일부 컬럼 미존재 시 기존 컬럼만으로 fallback
    console.warn('[fetchSuggestions] extended columns unavailable, falling back:', error?.message);
    const { data: basic, error: basicError } = await supabase
      .from('projects')
      .select('category, industry');
    if (basicError) { console.error('[fetchSuggestions] fallback error:', basicError); return; }
    if (basic) {
      setCategoryOptions(unique(basic.map((p: any) => p.category)));
      setIndustryOptions(unique(basic.map((p: any) => p.industry)));
    }
  };

  const setField = <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Slug
  const generateSlugFromTitle = async (title: string) => {
    if (!title.trim()) return;
    setSlugLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: title, targetLang: 'EN', sourceLang: 'KO' }),
      });
      const data = res.ok ? await res.json() : null;
      setField('slug', generateSlug({ title: data?.translated || title, date: form.date }));
    } catch {
      setField('slug', generateSlug({ title, date: form.date }));
    } finally {
      setSlugLoading(false);
    }
  };

  const handleTitleBlur = () => {
    if (!slugManuallyEdited && form.title && !(mode === 'edit' && initialData?.slug)) {
      generateSlugFromTitle(form.title);
    }
  };

  // Translation
  const translateField = async (text: string, targetLang: 'EN' | 'KO'): Promise<string> => {
    if (!text.trim()) return '';
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang, sourceLang: targetLang === 'EN' ? 'KO' : 'EN' }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Translation failed');
    return (await res.json()).translated || text;
  };

  const handleTranslateToEn = async () => {
    setTranslatingToEn(true);
    setTranslateEnError(null);
    try {
      const fields: Array<keyof ProjectFormData> = ['title', 'category', 'industry', 'description', 'content'];
      const updates: Partial<ProjectFormData> = {};
      for (const f of fields) {
        const val = form[f] as string;
        if (val.trim()) (updates as any)[`${f}_en`] = await translateField(val, 'EN');
      }
      setForm(prev => ({ ...prev, ...updates, translation_status: 'translated' }));
      fetchApiUsage();
    } catch (err: any) {
      setTranslateEnError(err.message || t?.translate?.error || 'Translation error');
    } finally {
      setTranslatingToEn(false);
    }
  };

  const handleTranslateToKo = async () => {
    setTranslatingToKo(true);
    setTranslateKoError(null);
    try {
      const pairs = [
        { en: 'title_en', ko: 'title' }, { en: 'category_en', ko: 'category' },
        { en: 'industry_en', ko: 'industry' }, { en: 'description_en', ko: 'description' },
        { en: 'content_en', ko: 'content' },
      ] as const;
      const updates: Partial<ProjectFormData> = {};
      for (const { en, ko } of pairs) {
        const val = form[en] as string;
        if (val.trim()) (updates as any)[ko] = await translateField(val, 'KO');
      }
      setForm(prev => ({ ...prev, ...updates, translation_status: 'translated' }));
      fetchApiUsage();
    } catch (err: any) {
      setTranslateKoError(err.message || t?.translate?.error || 'Translation error');
    } finally {
      setTranslatingToKo(false);
    }
  };

  // AI Polish
  const handlePolish = async (lang: 'ko' | 'en') => {
    const descField = lang === 'ko' ? 'description' : 'description_en';
    const text = form[descField];
    if (!text.trim()) return;

    if (lang === 'ko') { setPolishingKo(true); setPolishKoError(null); }
    else { setPolishingEn(true); setPolishEnError(null); }

    try {
      const res = await fetch('/api/ai-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: text,
          title: lang === 'ko' ? form.title : form.title_en,
          client: form.client,
          country: form.country,
          category: lang === 'ko' ? form.category : form.category_en,
          industry: lang === 'ko' ? form.industry : form.industry_en,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Polish failed');
      setField(descField, data.polished);
    } catch (err: any) {
      if (lang === 'ko') setPolishKoError(err.message || t?.polish?.error);
      else setPolishEnError(err.message || t?.polish?.error);
    } finally {
      if (lang === 'ko') setPolishingKo(false);
      else setPolishingEn(false);
    }
  };

  // Thumbnail
  const applyThumbnailFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleThumbnailDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsThumbnailDragging(true); };
  const handleThumbnailDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleThumbnailDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const root = thumbnailDropAreaRef.current;
    if (!root) { setIsThumbnailDragging(false); return; }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && root.contains(el)) return;
    setIsThumbnailDragging(false);
  };
  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsThumbnailDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) applyThumbnailFile(file);
  };

  // Tags
  const handleTagToggle = (tagName: string) => {
    setSelectedTagNames(prev =>
      prev.includes(tagName) ? prev.filter(n => n !== tagName) : [...prev, tagName]
    );
  };

  const handleCreateTag = async () => {
    if (!tagQuery.trim() || isCreatingTag) return;
    setIsCreatingTag(true);
    setTagCreateError(null);
    try {
      const result = await createTag(tagQuery.trim());
      if (!result.success || !result.data) throw new Error(result.error || 'Tag creation failed');
      setAllTags(prev => prev.some(t => t.id === result.data!.id) ? prev : [...prev, result.data!]);
      if (!selectedTagNames.includes(result.data.name)) {
        setSelectedTagNames(prev => [...prev, result.data!.name]);
      }
      setTagQuery('');
    } catch (err: any) {
      setTagCreateError(err.message);
    } finally {
      setIsCreatingTag(false);
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setUploadError(null);
    try {
      let finalImageUrl = thumbnailPreview ?? form.image_url;
      if (thumbnailFile) finalImageUrl = await uploadImageToStorage(thumbnailFile);

      const finalGalleryUrls: string[] = [];
      for (const img of galleryImages) {
        if (img.file) finalGalleryUrls.push(await uploadImageToStorage(img.file));
        else if (img.preview) finalGalleryUrls.push(img.preview);
      }

      await onSubmit({
        ...form,
        image_url: finalImageUrl ?? '',
        gallery_images: finalGalleryUrls,
        tags: selectedTagNames,
        slug: form.slug || generateSlug({ title: form.title, date: form.date }),
      });
    } catch (err: any) {
      setUploadError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-1';
  const sectionTitleCls = 'text-base font-semibold text-white border-b border-gray-700 pb-2 mb-4';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8 pb-6">

          {/* ── Section 1: Basic Info ── */}
          <section>
            <div className="flex items-baseline gap-3 border-b border-gray-700 pb-2 mb-4">
              <h3 className="text-base font-semibold text-white">
                {t?.sections?.basicInfo ?? 'Basic Info'}
              </h3>
              <span className="text-xs text-amber-400">
                {t?.sections?.basicInfoNote ?? 'Please write in English'}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t?.fields?.client ?? 'Client'}</label>
                  <input
                    type="text"
                    value={form.client}
                    onChange={e => setField('client', e.target.value)}
                    className={inputCls}
                    placeholder={t?.fields?.clientPlaceholder ?? 'e.g. Hyundai Motor'}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t?.fields?.country ?? 'Country'}</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => setField('country', e.target.value)}
                    className={inputCls}
                    placeholder={t?.fields?.countryPlaceholder ?? 'e.g. Germany'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t?.fields?.date ?? 'Date'}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setField('date', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t?.fields?.service ?? 'Service'}</label>
                  <SuggestCombobox
                    value={form.service}
                    onChange={val => setField('service', val)}
                    options={serviceOptions}
                    placeholder={t?.fields?.servicePlaceholder ?? 'e.g. BX, Web Design'}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Bilingual Content ── */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* KO Column */}
              <div className="space-y-4">
                <h3 className={sectionTitleCls}>
                  🇰🇷 {t?.sections?.koreanContent ?? '한국어 (KO)'}
                </h3>

                <div>
                  <label className={labelCls}>{t?.fields?.title ?? '제목'}</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    onBlur={handleTitleBlur}
                    className={inputCls}
                    placeholder={t?.fields?.titlePlaceholder ?? '프로젝트 제목을 입력하세요'}
                  />
                </div>

                <div>
                  <label className={labelCls}>{t?.fields?.category ?? '카테고리'}</label>
                  <SuggestCombobox
                    value={form.category}
                    onChange={val => setField('category', val)}
                    options={categoryOptions}
                    placeholder={t?.fields?.categoryPlaceholder ?? 'e.g. Web Design'}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>{t?.fields?.industry ?? '산업 분야'}</label>
                  <SuggestCombobox
                    value={form.industry}
                    onChange={val => setField('industry', val)}
                    options={industryOptions}
                    placeholder={t?.fields?.industryPlaceholder ?? 'e.g. IT / Telecom'}
                    className={inputCls}
                  />
                </div>

                {/* Description + Polish */}
                <div>
                  <label className={labelCls}>{t?.fields?.description ?? '요약 설명'}</label>
                  <textarea
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    rows={3}
                    className={inputCls}
                    placeholder={t?.fields?.descriptionPlaceholder ?? '특징, 느낌, 하고 싶은 말을 자유롭게 적어보세요'}
                  />
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePolish('ko')}
                      disabled={polishingKo || !form.description.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-700 text-white rounded-md hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
                    >
                      {polishingKo ? (
                        <><ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />{t?.polish?.polishing ?? '정리 중...'}</>
                      ) : (
                        <><SparklesIcon className="h-3.5 w-3.5" />{t?.polish?.button ?? '✨ 내용 정리'}</>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">{t?.polish?.hint ?? 'AI가 소개 문구로 다듬어 드립니다'}</span>
                  </div>
                  {polishKoError && <p className="mt-1 text-xs text-red-400">{polishKoError}</p>}
                </div>

                <div>
                  <label className={labelCls}>{t?.fields?.content ?? '상세 내용'}</label>
                  <textarea
                    value={form.content}
                    onChange={e => setField('content', e.target.value)}
                    rows={6}
                    className={inputCls}
                    placeholder={t?.fields?.contentPlaceholder ?? '프로젝트의 상세 내용을 입력하세요'}
                  />
                </div>

                {/* Translate → EN */}
                <div>
                  <button
                    type="button"
                    onClick={handleTranslateToEn}
                    disabled={translatingToEn || translatingToKo}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {translatingToEn ? (
                      <><ArrowPathIcon className="h-4 w-4 animate-spin" />{t?.translate?.translating ?? '번역 중...'}</>
                    ) : (
                      <><LanguageIcon className="h-4 w-4" />🤖 → {t?.translate?.toEnglish ?? '영어로 번역'}</>
                    )}
                  </button>
                  {translateEnError && <p className="mt-1 text-xs text-red-400">{translateEnError}</p>}
                </div>
              </div>

              {/* EN Column */}
              <div className="space-y-4">
                <h3 className={sectionTitleCls}>
                  🇺🇸 {t?.sections?.englishContent ?? 'English (EN)'}
                </h3>

                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={e => setField('title_en', e.target.value)}
                    className={inputCls}
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <label className={labelCls}>Category</label>
                  <SuggestCombobox
                    value={form.category_en}
                    onChange={val => setField('category_en', val)}
                    options={categoryEnOptions}
                    placeholder="e.g. Web Design, Video Production"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Industry</label>
                  <SuggestCombobox
                    value={form.industry_en}
                    onChange={val => setField('industry_en', val)}
                    options={industryEnOptions}
                    placeholder="e.g. IT / Telecom / Electronics"
                    className={inputCls}
                  />
                </div>

                {/* Description EN + Polish */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description_en}
                    onChange={e => setField('description_en', e.target.value)}
                    rows={3}
                    className={inputCls}
                    placeholder="Describe the project in one sentence"
                  />
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePolish('en')}
                      disabled={polishingEn || !form.description_en.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-700 text-white rounded-md hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
                    >
                      {polishingEn ? (
                        <><ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />{t?.polish?.polishing ?? 'Polishing...'}</>
                      ) : (
                        <><SparklesIcon className="h-3.5 w-3.5" />{t?.polish?.button ?? '✨ Polish'}</>
                      )}
                    </button>
                    <span className="text-xs text-gray-500">{t?.polish?.hint ?? 'AI rewrites your notes'}</span>
                  </div>
                  {polishEnError && <p className="mt-1 text-xs text-red-400">{polishEnError}</p>}
                </div>

                <div>
                  <label className={labelCls}>Content</label>
                  <textarea
                    value={form.content_en}
                    onChange={e => setField('content_en', e.target.value)}
                    rows={6}
                    className={inputCls}
                    placeholder="Enter the full project details"
                  />
                </div>

                {/* Translate → KO */}
                <div>
                  <button
                    type="button"
                    onClick={handleTranslateToKo}
                    disabled={translatingToKo || translatingToEn}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {translatingToKo ? (
                      <><ArrowPathIcon className="h-4 w-4 animate-spin" />{t?.translate?.translating ?? '번역 중...'}</>
                    ) : (
                      <><LanguageIcon className="h-4 w-4" />🤖 → {t?.translate?.toKorean ?? '한국어로 번역'}</>
                    )}
                  </button>
                  {translateKoError && <p className="mt-1 text-xs text-red-400">{translateKoError}</p>}
                </div>
              </div>
            </div>

            {/* DeepL usage */}
            {apiUsage && (
              <div className="mt-4 flex items-center justify-between px-3 py-2 bg-gray-800 rounded-md text-xs">
                <span className="text-blue-400">
                  📡 DeepL: {apiUsage.used?.toLocaleString()} / {apiUsage.limit?.toLocaleString()} chars
                </span>
                <span className={apiUsage.remaining < 10000 ? 'text-red-400' : 'text-gray-400'}>
                  Remaining: {apiUsage.remaining?.toLocaleString()}
                </span>
              </div>
            )}
          </section>

          {/* ── Section 3: Slug ── */}
          <section>
            <h3 className={sectionTitleCls}>{t?.fields?.slug ?? 'Slug'}</h3>
            <div>
              <label className={labelCls}>
                {t?.fields?.slug ?? 'Slug'}
                {t?.fields?.slugHint && (
                  <span className="ml-2 text-xs text-gray-500">{t.fields.slugHint}</span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => { setSlugManuallyEdited(true); setField('slug', e.target.value); }}
                    disabled={slugLoading}
                    className={`${inputCls} font-mono disabled:opacity-50`}
                    placeholder={t?.fields?.slugPlaceholder ?? 'e.g. 2025-project-name-abc123'}
                  />
                  {slugLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ArrowPathIcon className="h-4 w-4 text-amber-500 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setSlugManuallyEdited(false); generateSlugFromTitle(form.title); }}
                  disabled={slugLoading || !form.title}
                  title={t?.translate?.regenerateSlug ?? '슬러그 재생성'}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
              {slugManuallyEdited && (
                <p className="mt-1 text-xs text-amber-400">
                  {t?.translate?.slugManualHint ?? '슬러그를 직접 수정할 수 있습니다.'}
                </p>
              )}
            </div>
          </section>

          {/* ── Section 4: Media ── */}
          <section>
            <h3 className={sectionTitleCls}>{t?.sections?.media ?? 'Media'}</h3>

            <div className="mb-4">
              <label className={labelCls}>
                {t?.fields?.thumbnail ?? '대표 이미지'}
                {t?.fields?.thumbnailHint && (
                  <span className="ml-2 text-xs text-gray-500">{t.fields.thumbnailHint}</span>
                )}
              </label>
              <div
                ref={thumbnailDropAreaRef}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isThumbnailDragging ? 'border-amber-500 bg-amber-900/20' : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleThumbnailDragEnter}
                onDragOver={handleThumbnailDragOver}
                onDragLeave={handleThumbnailDragLeave}
                onDrop={handleThumbnailDrop}
                onClick={() => { if (!thumbnailPreview) thumbnailFileInputRef.current?.click(); }}
                style={{ cursor: thumbnailPreview ? 'default' : 'pointer' }}
              >
                {thumbnailPreview ? (
                  <div className="relative inline-block">
                    <Image src={thumbnailPreview} alt="Thumbnail preview" width={320} height={180}
                      className="mx-auto rounded-lg object-cover" unoptimized />
                    <button type="button"
                      onClick={e => { e.stopPropagation(); if (thumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(thumbnailPreview); setThumbnailFile(null); setThumbnailPreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                    <button type="button"
                      onClick={e => { e.stopPropagation(); thumbnailFileInputRef.current?.click(); }}
                      className="mt-2 block w-full text-xs text-gray-400 hover:text-gray-300 text-center">
                      Click to replace
                    </button>
                  </div>
                ) : (
                  <div>
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-400">Drag & drop or click to upload</p>
                  </div>
                )}
                <input ref={thumbnailFileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) applyThumbnailFile(f); }} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelCls}>{t?.fields?.gallery ?? '갤러리 이미지'}</label>
              <GalleryDropZone images={galleryImages} onImagesChange={setGalleryImages}
                onError={msg => console.warn('[Gallery]', msg)} />
            </div>

            <div>
              <label className={labelCls}>{t?.fields?.videoUrl ?? '동영상 URL'}</label>
              <input type="url" value={form.video_url}
                onChange={e => setField('video_url', e.target.value)} className={inputCls}
                placeholder={t?.fields?.videoUrlPlaceholder ?? 'YouTube or Vimeo URL'} />
            </div>
          </section>

          {/* ── Section 5: Tags ── */}
          <section>
            <h3 className={sectionTitleCls}>{t?.sections?.tags ?? 'Tags'}</h3>
            <div className="flex gap-2 mb-3">
              <Combobox value={tagQuery} onChange={setTagQuery}>
                <div className="relative flex-1">
                  <Combobox.Input className={inputCls}
                    placeholder={t?.fields?.tagPlaceholder ?? 'e.g. gamescom, Trade Fair Video'}
                    onChange={e => setTagQuery(e.target.value)} />
                  <Combobox.Options className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-gray-600 focus:outline-none text-sm">
                    {allTags.filter(tag => tag.name.toLowerCase().includes(tagQuery.toLowerCase())).map(tag => (
                      <Combobox.Option key={tag.id} value={tag.name}
                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-8 pr-4 ${active ? 'bg-amber-600 text-white' : 'text-gray-300'}`}
                        onClick={() => handleTagToggle(tag.name)}>
                        {selectedTagNames.includes(tag.name) && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-amber-400">✓</span>
                        )}
                        {tag.name}
                      </Combobox.Option>
                    ))}
                  </Combobox.Options>
                </div>
              </Combobox>
              <button type="button" onClick={handleCreateTag}
                disabled={!tagQuery.trim() || isCreatingTag}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm whitespace-nowrap">
                {isCreatingTag ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
                {t?.fields?.newTag ?? 'New Tag'}
              </button>
            </div>
            {tagCreateError && <p className="mb-2 text-xs text-red-400">{tagCreateError}</p>}
            {selectedTagNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTagNames.map(name => (
                  <span key={name} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-900/50 text-amber-200 rounded-full text-sm">
                    {name}
                    <button type="button" onClick={() => handleTagToggle(name)} className="text-amber-400 hover:text-amber-200">
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── Section 6: Settings ── */}
          <section>
            <h3 className={sectionTitleCls}>{t?.sections?.settings ?? 'Settings'}</h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t?.fields?.visibility ?? '공개 여부'}</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pf-visibility" value="public"
                      checked={form.visibility === 'public'} onChange={() => setField('visibility', 'public')}
                      className="text-amber-600 focus:ring-amber-500" />
                    <span className="flex items-center gap-1 text-gray-300 text-sm">
                      <EyeIcon className="h-4 w-4" />{t?.fields?.visibilityPublic ?? '공개'}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="pf-visibility" value="private"
                      checked={form.visibility === 'private'} onChange={() => setField('visibility', 'private')}
                      className="text-amber-600 focus:ring-amber-500" />
                    <span className="flex items-center gap-1 text-gray-300 text-sm">
                      <EyeSlashIcon className="h-4 w-4" />{t?.fields?.visibilityPrivate ?? '비공개'}
                    </span>
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_featured}
                  onChange={e => setField('is_featured', e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 bg-gray-700 border-gray-600 h-4 w-4" />
                <span className="text-gray-300 text-sm">{t?.fields?.isFeatured ?? '추천 프로젝트'}</span>
              </label>
            </div>
          </section>

          {uploadError && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-sm text-red-400">{uploadError}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-900 z-10">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors text-sm">
          {t?.cancel ?? '취소'}
        </button>
        <button type="submit" disabled={saving}
          className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm">
          {saving ? (
            <><ArrowPathIcon className="h-4 w-4 animate-spin" />{t?.saving ?? '저장 중...'}</>
          ) : (
            t?.save ?? '저장'
          )}
        </button>
      </div>
    </form>
  );
}
