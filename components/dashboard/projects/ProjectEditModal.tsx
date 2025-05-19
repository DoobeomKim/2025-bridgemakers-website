'use client';

import { useState, useRef, MouseEvent, ChangeEvent, DragEvent, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, EyeIcon, EyeSlashIcon, ChevronUpDownIcon, PlusIcon, ShareIcon } from '@heroicons/react/24/outline';
import { updateProject, getProjectById, getAllTags, createTag, linkTagsToProject } from '@/lib/projects';
import { uploadImageToStorage } from '@/lib/imageUtils';
import { Locale } from '@/lib/i18n';
import { Combobox } from '@headlessui/react';
import { generateSlug } from '@/lib/utils';
import { getYouTubeVideoId } from '@/lib/utils';
import { ProjectData } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Project, ProjectImage, ProjectTag } from '@/lib/database.types';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locale: Locale;
  projectId: string;
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
  { id: 'design', name: '디자인' },
  { id: 'marketing', name: '마케팅' },
  { id: 'other', name: '기타' },
];

// 기본 산업 목록
const defaultIndustries = [
  { id: 'it', name: 'IT/소프트웨어' },
  { id: 'finance', name: '금융/핀테크' },
  { id: 'education', name: '교육' },
  { id: 'healthcare', name: '의료/헬스케어' },
  { id: 'ecommerce', name: '이커머스/리테일' },
  { id: 'manufacturing', name: '제조업' },
  { id: 'entertainment', name: '엔터테인먼트' },
  { id: 'logistics', name: '물류/운송' },
  { id: 'real_estate', name: '부동산' },
  { id: 'other', name: '기타' },
];

// 폼 상태 타입 정의
interface ProjectFormData extends ProjectData {
  tags: string[];  // tags를 필수 필드로 정의
  categoryName: string;
  industryName: string;
}

export default function ProjectEditModal({ isOpen, onClose, onSuccess, locale, projectId }: ProjectEditModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailDropAreaRef = useRef<HTMLDivElement>(null);

  // ESC 키 이벤트 핸들러 추가
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // 폼 상태 초기화
  const [form, setForm] = useState<ProjectFormData>({
    title: "",
    description: "",
    content: "",
    category: "",
    categoryName: "",
    client: "",
    date: new Date().toISOString().split('T')[0],
    country: "",
    industry: "",
    industryName: "",
    image_url: "",
    video_url: "",
    video_thumbnail_url: "",
    visibility: "private" as 'public' | 'private',
    slug: "",
    tags: [],
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [categoryQuery, setcategoryQuery] = useState('');
  const [industryQuery, setIndustryQuery] = useState('');
  
  // 비디오 썸네일 관련 상태 추가
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  // 태그 관련 상태 추가
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<Pick<ProjectTag, 'id' | 'name'>[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  // 갤러리 이미지 관련 상태 추가
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // 카테고리 필터링 함수
  const filteredCategories =
    categoryQuery === ''
      ? defaultCategories
      : defaultCategories.filter((category) => {
          return category.name.toLowerCase().includes(categoryQuery.toLowerCase());
        });

  // 산업 필터링 함수
  const filteredIndustries =
    industryQuery === ''
      ? defaultIndustries
      : defaultIndustries.filter((industry) => {
          return industry.name.toLowerCase().includes(industryQuery.toLowerCase());
        });

  // 프로젝트 데이터 로드
  useEffect(() => {
    if (isOpen && projectId) {
      setLoading(true);
      getProjectById(projectId)
        .then(async data => {
          if (data) {
            // 폼 상태 초기화
            setForm({
              title: data.title || "",
              description: data.description || "",
              content: data.content || "",
              category: data.category || "",
              categoryName: data.category_name || "",
              client: data.client || "",
              date: data.date || new Date().toISOString().split('T')[0],
              country: data.country || "",
              industry: data.industry || "",
              industryName: data.industry_name || "",
              image_url: data.image_url || "",
              video_url: data.video_url || "",
              video_thumbnail_url: data.video_thumbnail_url || "",
              visibility: data.visibility || "private",
              slug: data.slug || "",
              tags: data.tags.map(tag => tag.id),
            });

            // 이미지 URL이 있으면 미리보기 설정
            if (data.image_url) {
              setImagePreview(data.image_url);
            }
            
            // 비디오 썸네일 URL이 있으면 미리보기 설정
            if (data.video_thumbnail_url) {
              setThumbnailPreview(data.video_thumbnail_url);
            }

            // 선택된 태그 설정
            setSelectedTags(data.tags.map(tag => ({
              id: tag.id,
              name: tag.name
            })));

            // 갤러리 이미지 로드
            if (data.project_images && data.project_images.length > 0) {
              // 정렬 순서대로 이미지 정렬
              const sortedImages = [...data.project_images].sort((a, b) => a.sort_order - b.sort_order);
              
              // 이미지 미리보기 설정
              setGalleryImages(sortedImages.map(image => ({
                file: null, // 기존 이미지는 파일이 없음
                preview: image.image_url,
                id: image.id // 기존 이미지 ID 저장
              })));
            }
          }
        })
        .catch(err => {
          console.error("프로젝트 로드 오류:", err);
          setError("프로젝트 데이터를 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, projectId]);

  // 태그 관련 핸들러
  const handleAddTag = async () => {
    if (!tagInput.trim()) return;

    // 이미 선택된 태그인지 확인
    if (selectedTags.some((tag: Pick<ProjectTag, 'id' | 'name'>) => tag.name.toLowerCase() === tagInput.toLowerCase())) {
      setTagInput('');
      return;
    }

    // 기존 태그에서 찾기
    const existingTag = tags.find((tag: ProjectTag) => tag.name.toLowerCase() === tagInput.toLowerCase());

    if (existingTag) {
      setSelectedTags([...selectedTags, { id: existingTag.id, name: existingTag.name }]);
      setForm(prev => ({ ...prev, tags: [...prev.tags, existingTag.id] }));
    } else {
      // 새 태그 생성
      const result = await createTag(tagInput);
      if (result.success && result.data) {
        const newTag = result.data;
        setTags([...tags, newTag]);
        setSelectedTags([...selectedTags, { id: newTag.id, name: newTag.name }]);
        setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.id] }));
      }
    }

    setTagInput('');
  };

  // 태그 제거 핸들러
  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
    setForm(prev => ({ ...prev, tags: prev.tags.filter(id => id !== tagId) }));
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const fieldName = e.target.name;
    
    // slug를 직접 수정하는 경우에만 값을 변경
    if (fieldName === 'slug') {
      setForm(prevForm => ({
        ...prevForm,
        slug: newValue,
        tags: prevForm.tags // 기존 tags 값을 유지
      }));
    } else {
      // 다른 필드들은 그냥 업데이트
      setForm(prevForm => ({
        ...prevForm,
        [fieldName]: newValue,
        tags: prevForm.tags // 기존 tags 값을 유지
      }));
    }
  };

  // 공개 설정 변경 핸들러
  const handleVisibilityChange = (value: 'public' | 'private') => {
    setForm(prevForm => ({
      ...prevForm,
      visibility: value,
      tags: prevForm.tags // 기존 tags 값을 유지
    }));
  };

  // 이미지 선택 버튼 클릭 처리
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 드래그 이벤트 처리
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 자식 요소에서 발생한 이벤트는 무시 (dropArea 자체를 벗어났을 때만 처리)
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  // 이미지 파일 처리 함수 (파일 선택과 드래그 앤 드롭에서 공통으로 사용)
  const handleImageFile = (file: File) => {
    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 검증 (최대 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 최대 10MB까지 가능합니다.');
      return;
    }

    setImageFile(file);
    setError(''); // 에러 상태 초기화
    
    // 미리보기 생성
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  // 이미지 선택 처리
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleImageFile(files[0]);
  };

  // 카테고리 변경 핸들러 수정
  const handleCategoryChange = (value: string) => {
    const selectedCategory = defaultCategories.find(cat => cat.id === value);
    const newCategoryName = selectedCategory ? selectedCategory.name : value;
    
    setForm((prevForm: ProjectFormData) => ({
      ...prevForm,
      category: value,
      categoryName: newCategoryName
    }));
  };

  // Combobox onChange 핸들러 수정
  const handleCategoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setcategoryQuery(newValue);
    
    setForm(prevForm => ({
      ...prevForm,
      category: newValue,
      categoryName: newValue
    }));
  };

  // 산업 변경 핸들러 수정
  const handleIndustryChange = (value: string) => {
    const selectedIndustry = defaultIndustries.find(ind => ind.id === value);
    const newIndustryName = selectedIndustry ? selectedIndustry.name : value;
    
    setForm((prevForm: ProjectFormData) => ({
      ...prevForm,
      industry: value,
      industryName: newIndustryName
    }));
  };

  // 산업 입력 핸들러 수정
  const handleIndustryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setIndustryQuery(newValue);
    
    setForm(prevForm => ({
      ...prevForm,
      industry: newValue,
      industryName: newValue
    }));
  };

  // slug 자동 생성 핸들러 수정
  const handleGenerateSlug = () => {
    const newSlug = generateSlug({
      client: form.client,
      category: form.categoryName,
      date: form.date
    });
    
    setForm(prevForm => ({
      ...prevForm,
      slug: newSlug
    }));
  };

  // 썸네일 이미지 파일 처리 함수
  const handleThumbnailFile = (file: File) => {
    // 이미지 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    // 파일 크기 검증 (최대 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 최대 10MB까지 가능합니다.');
      return;
    }

    setThumbnailFile(file);
    setError(''); // 에러 상태 초기화
    
    // 미리보기 생성
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
  };

  // 썸네일 선택 처리
  const handleThumbnailChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleThumbnailFile(files[0]);
  };

  // 썸네일 선택 버튼 클릭 처리
  const handleThumbnailButtonClick = () => {
    thumbnailFileInputRef.current?.click();
  };

  // 썸네일 드래그 이벤트 처리
  const handleThumbnailDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingThumbnail) setIsDraggingThumbnail(true);
  };

  const handleThumbnailDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (thumbnailDropAreaRef.current && !thumbnailDropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDraggingThumbnail(false);
    }
  };

  const handleThumbnailDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThumbnail(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleThumbnailFile(files[0]);
    }
  };

  // 비디오 URL 변경 핸들러
  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm(prevForm => ({
      ...prevForm,
      video_url: url,
      tags: prevForm.tags // 기존 tags 값을 유지
    }));
  };

  // 갤러리 이미지 선택 처리
  const handleGalleryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 10 - galleryImages.length;
    
    // 파일 크기 및 개수 제한 확인
    const validFiles = files.slice(0, remainingSlots).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name}의 크기가 5MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    // 이미지 미리보기 생성
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages(prev => [
          ...prev,
          {
            file,
            preview: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    // 입력 초기화
    e.target.value = '';
  };

  // 갤러리 이미지 제거
  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview); // 미리보기 URL 해제
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // 갤러리 이미지 순서 변경
  const handleReorderGalleryImages = (dragIndex: number, dropIndex: number) => {
    setGalleryImages(prev => {
      const newImages = [...prev];
      const [draggedImage] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      return newImages;
    });
  };

  // 갤러리 이미지 업로드
  const uploadGalleryImages = async () => {
    const galleryUrls: string[] = [];
    const existingImages = galleryImages.filter(img => !img.file && img.id);
    const newImages = galleryImages.filter(img => img.file);

    // 새로운 이미지 업로드
    if (newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        if (!image.file) continue;

        try {
          const url = await uploadImageToStorage(image.file);
          galleryUrls.push(url);
        } catch (error: any) {
          throw new Error(`갤러리 이미지 ${i + 1} 업로드 실패: ${error.message}`);
        }
      }
    }

    // 기존 이미지 삭제 (유지할 이미지 제외)
    if (projectId) {
      const { data: currentImages } = await supabase
        .from('project_images')
        .select('id')
        .eq('project_id', projectId);

      if (currentImages) {
        const existingIds = existingImages.map(img => img.id);
        const toDelete = currentImages
          .filter(img => !existingIds.includes(img.id))
          .map(img => img.id);

        if (toDelete.length > 0) {
          await supabase
            .from('project_images')
            .delete()
            .in('id', toDelete);
        }
      }
    }

    // 새로운 이미지 데이터 생성
    const galleryData = [
      // 기존 이미지 유지 (순서 업데이트)
      ...existingImages.map((img, index) => ({
        id: img.id,
        project_id: projectId,
        image_url: img.preview,
        sort_order: index
      })),
      // 새로운 이미지 추가
      ...galleryUrls.map((url, index) => ({
        project_id: projectId,
        image_url: url,
        sort_order: existingImages.length + index
      }))
    ];

    // 갤러리 데이터 저장
    if (galleryData.length > 0) {
      await supabase
        .from('project_images')
        .upsert(galleryData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // 필수 필드 검증
      if (!form.title || !form.description || !form.categoryName) {
        throw new Error("필수 항목을 모두 입력해주세요");
      }

      // 이미지 파일이 선택되었는지 확인
      if (!imageFile && !form.image_url) {
        throw new Error("프로젝트 대표 이미지를 선택해주세요");
      }

      // 새 이미지가 선택되었다면 업로드
      let finalImageUrl = form.image_url;
      if (imageFile) {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadImageToStorage(imageFile);
          
          // URL이 유효한지 확인
          if (!finalImageUrl || typeof finalImageUrl !== 'string' || !finalImageUrl.startsWith('http')) {
            throw new Error(`유효하지 않은 이미지 URL: ${finalImageUrl}`);
          }
        } catch (uploadError: any) {
          throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
        } finally {
          setUploadingImage(false);
        }
      }

      // 새 썸네일이 선택되었다면 업로드
      let finalThumbnailUrl = form.video_thumbnail_url;
      if (thumbnailFile) {
        setUploadingThumbnail(true);
        try {
          finalThumbnailUrl = await uploadImageToStorage(thumbnailFile);
          
          // URL이 유효한지 확인
          if (!finalThumbnailUrl || typeof finalThumbnailUrl !== 'string' || !finalThumbnailUrl.startsWith('http')) {
            throw new Error(`유효하지 않은 썸네일 URL: ${finalThumbnailUrl}`);
          }
        } catch (uploadError: any) {
          throw new Error(`썸네일 업로드 실패: ${uploadError.message}`);
        } finally {
          setUploadingThumbnail(false);
        }
      }

      // 최종 데이터로 프로젝트 업데이트
      const projectData = {
        ...form,
        image_url: finalImageUrl,
        video_thumbnail_url: finalThumbnailUrl
      };

      // 프로젝트 업데이트
      const result = await updateProject(projectId, projectData);
      
      if (!result) {
        throw new Error("프로젝트 수정 중 오류가 발생했습니다");
      }

      // 갤러리 이미지 업로드 및 연결
      await uploadGalleryImages();

      // 태그 연결 업데이트
      if (form.tags.length > 0) {
        // 기존 태그 관계 삭제
        await linkTagsToProject(projectId, form.tags);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "저장에 실패했습니다");
      console.error('프로젝트 수정 오류:', err);
    } finally {
      setSaving(false);
    }
  };

  // 모달 외부 클릭 시 닫기 처리
  const handleBackdropClick = (e: MouseEvent) => {
    // 모달 외부 클릭 시에만 닫기
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-[#1A2234] rounded-standard text-left overflow-hidden shadow-lg transform transition-all sm:max-w-3xl w-full">
          {/* 모달 헤더 */}
          <div className="bg-[#232b3d] px-6 py-4 flex justify-between items-center border-b border-[#353f54]">
            <h3 className="text-h3 font-bold text-white tracking-[0.5px]">프로젝트 수정</h3>
            <button
              onClick={onClose}
              className="text-gray-medium hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 로딩 상태 */}
          <div className="p-6 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-medium">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>프로젝트 정보를 불러오는 중...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        {/* 모달 컨테이너 */}
        <div 
          ref={modalRef}
          className="bg-[#1A2234] rounded-standard text-left overflow-hidden shadow-lg transform transition-all sm:max-w-3xl w-full"
        >
          {/* 모달 헤더 */}
          <div className="bg-[#232b3d] px-6 py-4 flex justify-between items-center border-b border-[#353f54]">
            <h3 className="text-h3 font-bold text-white tracking-[0.5px]">프로젝트 수정</h3>
            <button
              onClick={onClose}
              className="text-gray-medium hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* 모달 본문 */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(100vh-260px)]">
            <div className="space-y-6">
              {/* 이미지 업로드 영역 */}
              <div
                ref={dropAreaRef}
                className={`border-2 border-dashed rounded-standard p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-gold bg-gold/5'
                    : 'border-[#353f54] hover:border-gold/50'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="max-h-64 mx-auto rounded-standard object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/75 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={handleImageButtonClick}
                    className="cursor-pointer space-y-2"
                  >
                    <PhotoIcon className="h-12 w-12 mx-auto text-white/50" />
                    <div className="text-white/80">
                      <span className="text-gold">이미지를 선택</span>하거나 드래그하여 업로드하세요
                    </div>
                    <div className="text-white/60 text-sm">
                      권장 크기: 1920x1080px (16:9), 최대 10MB
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* 입력 필드 그룹 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    프로젝트명 <span className="text-[#ff9494]">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    placeholder="프로젝트 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    클라이언트
                  </label>
                  <input
                    type="text"
                    name="client"
                    value={form.client}
                    onChange={handleChange}
                    className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    placeholder="클라이언트명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    카테고리 <span className="text-[#ff9494]">*</span>
                  </label>
                  <Combobox
                    value={form.category}
                    onChange={handleCategoryChange}
                  >
                    <div className="relative">
                      <div className="relative w-full">
                        <Combobox.Input
                          className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all pr-10"
                          onChange={handleCategoryInputChange}
                          displayValue={(value: string) => {
                            const selectedCategory = defaultCategories.find(cat => cat.id === value);
                            return selectedCategory ? selectedCategory.name : value;
                          }}
                          placeholder="카테고리 선택 또는 입력"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-[#8B8EA0]"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-standard bg-[#232b3d] border border-[#353f54] py-1 shadow-lg z-10">
                        {filteredCategories.map((category) => (
                          <Combobox.Option
                            key={category.id}
                            value={category.id}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                active ? 'bg-gold/10 text-white' : 'text-[#8B8EA0]'
                              }`
                            }
                          >
                            {category.name}
                          </Combobox.Option>
                        ))}
                        {categoryQuery && !filteredCategories.some(cat => cat.name.toLowerCase() === categoryQuery.toLowerCase()) && (
                          <Combobox.Option
                            value={categoryQuery}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                active ? 'bg-gold/10 text-white' : 'text-[#8B8EA0]'
                              }`
                            }
                          >
                            새 카테고리 추가: {categoryQuery}
                          </Combobox.Option>
                        )}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>

                <div>
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    날짜
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    산업
                  </label>
                  <Combobox
                    value={form.industry}
                    onChange={handleIndustryChange}
                  >
                    <div className="relative">
                      <div className="relative w-full">
                        <Combobox.Input
                          className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all pr-10"
                          onChange={handleIndustryInputChange}
                          displayValue={(value: string) => {
                            const selectedIndustry = defaultIndustries.find(ind => ind.id === value);
                            return selectedIndustry ? selectedIndustry.name : value;
                          }}
                          placeholder="산업 선택 또는 입력"
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center px-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-[#8B8EA0]"
                            aria-hidden="true"
                          />
                        </Combobox.Button>
                      </div>
                      <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-standard bg-[#232b3d] border border-[#353f54] py-1 shadow-lg z-10">
                        {filteredIndustries.map((industry) => (
                          <Combobox.Option
                            key={industry.id}
                            value={industry.id}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                active ? 'bg-gold/10 text-white' : 'text-[#8B8EA0]'
                              }`
                            }
                          >
                            {industry.name}
                          </Combobox.Option>
                        ))}
                        {industryQuery && !filteredIndustries.some(ind => ind.name.toLowerCase() === industryQuery.toLowerCase()) && (
                          <Combobox.Option
                            value={industryQuery}
                            className={({ active }) =>
                              `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                                active ? 'bg-gold/10 text-white' : 'text-[#8B8EA0]'
                              }`
                            }
                          >
                            새 산업 추가: {industryQuery}
                          </Combobox.Option>
                        )}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>

                <div>
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    국가
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                    placeholder="국가를 입력하세요"
                  />
                </div>
              </div>

              {/* URL 슬러그 입력 */}
              <div className="flex items-end space-x-2">
                <div className="flex-grow">
                  <label className="block text-[#8B8EA0] font-medium mb-2">
                    URL 슬러그
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-standard border border-r-0 border-[#353f54] bg-[#1d2638] text-[#8B8EA0]">
                      /projects/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      className="flex-grow rounded-r-standard bg-[#232b3d] border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                      placeholder="my-awesome-project"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  className="px-4 py-2.5 bg-[#232b3d] text-[#8B8EA0] rounded-standard border border-[#353f54] hover:border-gold/30 transition-colors"
                >
                  자동생성
                </button>
              </div>

              {/* 비디오 URL 입력 필드 */}
              <div>
                <label className="block text-[#8B8EA0] font-medium mb-2">
                  비디오 URL
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={form.video_url}
                  onChange={handleVideoUrlChange}
                  className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  placeholder="YouTube 비디오 URL을 입력하세요"
                />
              </div>

              {/* 비디오 썸네일 업로드 영역 */}
              <div>
                <label className="block text-[#8B8EA0] font-medium mb-2">
                  비디오 썸네일
                </label>
                <div
                  ref={thumbnailDropAreaRef}
                  className={`border-2 border-dashed rounded-standard p-6 text-center transition-colors ${
                    isDraggingThumbnail
                      ? 'border-gold bg-gold/5'
                      : 'border-[#353f54] hover:border-gold/50'
                  }`}
                  onDragEnter={handleThumbnailDragEnter}
                  onDragOver={handleThumbnailDragOver}
                  onDragLeave={handleThumbnailDragLeave}
                  onDrop={handleThumbnailDrop}
                >
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="썸네일 미리보기"
                        className="max-h-64 mx-auto rounded-standard object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null);
                          setThumbnailFile(null);
                          setForm(prev => ({ ...prev, video_thumbnail_url: '' }));
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/75 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={handleThumbnailButtonClick}
                      className="cursor-pointer space-y-2"
                    >
                      <PhotoIcon className="h-12 w-12 mx-auto text-white/50" />
                      <div className="text-white/80">
                        <span className="text-gold">썸네일 이미지 선택</span>하거나 드래그하여 업로드하세요
                      </div>
                      <div className="text-white/60 text-sm">
                        권장 크기: 1280x720px (16:9), 최대 5MB
                      </div>
                    </div>
                  )}
                  <input
                    ref={thumbnailFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 설명 입력 영역 */}
              <div>
                <label className="block text-[#8B8EA0] font-medium mb-2">
                  설명 <span className="text-[#ff9494]">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none"
                  placeholder="프로젝트에 대한 간략한 설명을 입력하세요"
                ></textarea>
              </div>

              {/* 콘텐츠 입력 영역 */}
              <div>
                <label className="block text-[#8B8EA0] font-medium mb-2">
                  콘텐츠
                </label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={10}
                  className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none"
                  placeholder="프로젝트 상세 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
                ></textarea>
              </div>

              {/* 태그 입력 영역 추가 */}
              <div>
                <label className="block text-[#8B8EA0] font-medium mb-2">
                  태그
                </label>
                <div className="space-y-3">
                  {/* 선택된 태그 표시 */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#232b3d] text-gold border border-gold/50"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag.id)}
                            className="ml-2 text-gold hover:text-gold/80"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 태그 입력 필드 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="flex-1 bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                      placeholder="태그를 입력하고 Enter 키를 누르세요"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2.5 bg-[#232b3d] text-[#8B8EA0] rounded-standard border border-[#353f54] hover:border-gold/30 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 태그 제안 */}
                  {tagInput && !isLoadingTags && (
                    <div className="mt-2">
                      <div className="text-sm text-[#8B8EA0] mb-1">추천 태그:</div>
                      <div className="flex flex-wrap gap-2">
                        {tags
                          .filter(tag => 
                            tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                            !selectedTags.some(selected => selected.id === tag.id)
                          )
                          .slice(0, 5)
                          .map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setSelectedTags([...selectedTags, { id: tag.id, name: tag.name }]);
                                setForm(prev => ({ ...prev, tags: [...prev.tags, tag.id] }));
                                setTagInput('');
                              }}
                              className="px-3 py-1 rounded-full text-sm bg-[#232b3d] text-[#8B8EA0] border border-[#353f54] hover:border-gold/30 transition-colors"
                            >
                              {tag.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 갤러리 이미지 업로드 영역 */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  프로젝트 갤러리 이미지
                  <span className="text-xs text-gray-400 ml-2">(최대 10장, 16:9 권장, 장당 5MB 이하)</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {/* 갤러리 이미지 미리보기 */}
                  {galleryImages.map((image, index) => (
                    <div key={index} className="relative w-40 h-24 group">
                      <Image
                        src={image.preview}
                        alt={`갤러리 이미지 ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryImages(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* 이미지 추가 버튼 */}
                  {galleryImages.length < 10 && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="w-40 h-24 flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <PhotoIcon className="w-8 h-8 text-gray-500" />
                    </button>
                  )}
                </div>

                {/* 파일 입력 */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryImageSelect}
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-standard text-red-500">
                  {error}
                </div>
              )}
            </div>
          </form>
          
          {/* 제출 버튼 - 폼 외부에 배치 */}
          <div className="flex justify-between items-center p-6 pt-3 bg-[#1A2234] border-t border-[#353f54]">
            {/* 공개설정 버튼 */}
            <div className="flex items-center space-x-4">
              <span className="text-[#8B8EA0] font-medium">공개 설정:</span>
              <button
                type="button"
                onClick={() => handleVisibilityChange('public')}
                className={`px-4 py-2 rounded-standard flex items-center space-x-2 transition-colors ${
                  form.visibility === 'public'
                    ? 'bg-gold/20 text-gold border border-gold/50'
                    : 'bg-[#232b3d] text-[#8B8EA0] border border-[#353f54] hover:border-gold/30'
                }`}
              >
                <EyeIcon className="h-5 w-5" />
                <span>공개</span>
              </button>
              <button
                type="button"
                onClick={() => handleVisibilityChange('private')}
                className={`px-4 py-2 rounded-standard flex items-center space-x-2 transition-colors ${
                  form.visibility === 'private'
                    ? 'bg-gold/20 text-gold border border-gold/50'
                    : 'bg-[#232b3d] text-[#8B8EA0] border border-[#353f54] hover:border-gold/30'
                }`}
              >
                <EyeSlashIcon className="h-5 w-5" />
                <span>비공개</span>
              </button>
            </div>

            {/* 취소/저장 버튼 */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#232b3d] text-[#8B8EA0] rounded-standard border border-[#353f54] hover:border-gold/30 transition-colors"
                disabled={saving}
              >
                취소
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (modalRef.current) {
                    const form = modalRef.current.querySelector('form');
                    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }}
                className="px-5 py-2.5 bg-[#232b3d] text-gold rounded-standard font-medium border-2 border-gold hover:bg-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gold" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    저장 중...
                  </div>
                ) : (
                  "저장"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}