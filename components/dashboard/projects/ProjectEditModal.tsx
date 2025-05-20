'use client';

import { useState, useRef, MouseEvent, ChangeEvent, DragEvent, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, EyeIcon, EyeSlashIcon, ChevronUpDownIcon, PlusIcon, ShareIcon } from '@heroicons/react/24/outline';
import { updateProject, getProjectById, getAllTags, createTag, linkTagsToProject } from '@/lib/projects';
import { uploadImageToStorage, resizeImage } from '@/lib/imageUtils';
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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableGalleryImage from './DraggableGalleryImage';

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
    client: "",
    date: new Date().toISOString().split('T')[0],
    country: "",
    industry: "",
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

  // 삭제된 이미지 ID를 추적하기 위한 상태 추가
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

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
              client: data.client || "",
              date: data.date || new Date().toISOString().split('T')[0],
              country: data.country || "",
              industry: data.industry || "",
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

  // 태그 목록 로드
  useEffect(() => {
    const loadTags = async () => {
      setIsLoadingTags(true);
      try {
        const result = await getAllTags();
        if (result?.data) {
          setTags(result.data);
        }
      } catch (error) {
        console.error('태그 로드 오류:', error);
      } finally {
        setIsLoadingTags(false);
      }
    };

    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  // 태그 관련 핸들러
  const handleAddTag = async () => {
    if (!tagInput.trim()) return;

    try {
      const inputTagName = tagInput.trim().toLowerCase();

      // 이미 선택된 태그인지 확인
      const isAlreadySelected = selectedTags.some(tag => 
        tag.name.toLowerCase() === inputTagName
      );

      if (isAlreadySelected) {
        setTagInput('');
        return;
      }

      // 기존 태그 목록에서 찾기
      const existingTag = tags.find(tag => 
        tag.name.toLowerCase() === inputTagName
      );

      if (existingTag) {
        // 이미 존재하는 태그 선택
        setSelectedTags(prev => [...prev, existingTag]);
        setForm(prev => ({ ...prev, tags: [...prev.tags, existingTag.id] }));
      } else {
        // 새 태그 생성
        const result = await createTag(tagInput.trim());
        if (result.success && result.data) {
          const newTag = result.data;
          setTags(prev => [...prev, newTag]);
          setSelectedTags(prev => [...prev, newTag]);
          setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.id] }));
        }
      }

      setTagInput('');
    } catch (error) {
      console.error('태그 추가 중 오류 발생:', error);
    }
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

  // 카테고리 변경 핸들러
  const handleCategoryChange = (value: string) => {
    setForm(prevForm => ({
      ...prevForm,
      category: value
    }));
  };

  // Combobox onChange 핸들러 수정
  const handleCategoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setcategoryQuery(newValue);
    
    setForm(prevForm => ({
      ...prevForm,
      category: newValue,
    }));
  };

  // 산업 변경 핸들러
  const handleIndustryChange = (value: string) => {
    setForm(prevForm => ({
      ...prevForm,
      industry: value
    }));
  };

  // 산업 입력 핸들러 수정
  const handleIndustryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setIndustryQuery(newValue);
    
    setForm(prevForm => ({
      ...prevForm,
      industry: newValue,
    }));
  };

  // slug 자동 생성 핸들러 수정
  const handleGenerateSlug = async () => {
    const newSlug = await generateSlug({
      client: form.client,
      category: form.category,
      date: form.date,
      title: form.title  // 제목 추가
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
    
    // 파일 크기, 포맷, 비율 검증
    const validFiles = files.slice(0, remainingSlots).filter(file => {
      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name}의 크기가 5MB를 초과합니다.`);
        return false;
      }

      // 파일 포맷 검증
      const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validFormats.includes(file.type)) {
        setError(`${file.name}은(는) 지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP만 가능)`);
        return false;
      }

      return true;
    });

    // 이미지 미리보기 생성 및 비율 검증
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement('img');
        img.onload = () => {
          // 이미지 비율 검증 (16:9 = 1.77778)
          const aspectRatio = img.width / img.height;
          if (Math.abs(aspectRatio - 16/9) > 0.1) { // 10% 오차 허용
            setError(`${file.name}의 비율이 16:9와 크게 다릅니다. 이미지가 왜곡될 수 있습니다.`);
          }
          
        setGalleryImages(prev => [
          ...prev,
          {
            file,
            preview: reader.result as string
          }
        ]);
        };
        img.src = reader.result as string;
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
      const removedImage = newImages[index];
      
      // 기존 이미지인 경우 삭제 목록에 추가
      if (removedImage.id) {
        setDeletedImageIds(prev => [...prev, removedImage.id!]);
      }
      
      URL.revokeObjectURL(newImages[index].preview); // 미리보기 URL 해제
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // 갤러리 이미지 순서 변경 핸들러 추가
  const moveGalleryImage = (dragIndex: number, hoverIndex: number) => {
    setGalleryImages(prevImages => {
      const newImages = [...prevImages];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  };

  // 갤러리 이미지 업로드
  const uploadGalleryImages = async (projectId: string) => {
    // 삭제된 이미지 처리
    if (deletedImageIds.length > 0) {
      await supabase
        .from('project_images')
        .delete()
        .in('id', deletedImageIds);
    }

    const galleryUrls: string[] = [];
    const existingImages: { id: string; image_url: string; }[] = [];

    // 이미지 업로드 및 기존 이미지 정보 수집
    for (let i = 0; i < galleryImages.length; i++) {
      const image = galleryImages[i];
      
      if (image.id) {
        // 기존 이미지는 URL만 보관
        existingImages.push({
          id: image.id,
          image_url: image.preview
        });
        continue;
      }

        if (!image.file) continue;

        try {
        // 새 이미지 리사이징 및 최적화
        const { blob } = await resizeImage(image.file);
        const optimizedFile = new File([blob], image.file.name, { type: image.file.type });
        
        const url = await uploadImageToStorage(optimizedFile);
          galleryUrls.push(url);
        } catch (error: any) {
          throw new Error(`갤러리 이미지 ${i + 1} 업로드 실패: ${error.message}`);
        }
    }

    // 새 이미지 데이터 생성
    if (galleryUrls.length > 0) {
      const newGalleryData = galleryUrls.map((url, index) => ({
        project_id: projectId,
        image_url: url,
        sort_order: existingImages.length + index
      }));

      // 새 이미지 저장
          await supabase
            .from('project_images')
        .insert(newGalleryData);
    }

    // 기존 이미지 순서 업데이트
    for (let i = 0; i < existingImages.length; i++) {
      await supabase
        .from('project_images')
        .update({ sort_order: i })
        .eq('id', existingImages[i].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      // 필수 필드 검증
      if (!form.title || !form.category) {
        throw new Error("필수 항목을 모두 입력해주세요");
      }

      setSaving(true);
      setError("");

      // 새로운 이미지가 있으면 업로드
      if (imageFile) {
        setUploadingImage(true);
        const imageUrl = await uploadImageToStorage(imageFile);
        if (imageUrl) {
          form.image_url = imageUrl;
        }
        setUploadingImage(false);
      }

      // 새로운 비디오 썸네일이 있으면 업로드
      if (thumbnailFile) {
        setUploadingThumbnail(true);
        const thumbnailUrl = await uploadImageToStorage(thumbnailFile);
        if (thumbnailUrl) {
          form.video_thumbnail_url = thumbnailUrl;
        }
        setUploadingThumbnail(false);
      }

      // 갤러리 이미지 업로드 및 정리
      const galleryResult = await uploadGalleryImages(projectId);
      
      // 프로젝트 데이터 업데이트
      const result = await updateProject(projectId, {
        ...form,
        updated_at: new Date().toISOString()
      });

      if (!result) {
        throw new Error("프로젝트 수정 중 오류가 발생했습니다");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("프로젝트 수정 오류:", err);
      setError(err.message || "프로젝트 수정 중 오류가 발생했습니다");
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
                  {form.video_url ? '비디오 썸네일' : '대체 이미지'}
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
                        alt={form.video_url ? "썸네일 미리보기" : "대체 이미지 미리보기"}
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
                        <span className="text-gold">{form.video_url ? '썸네일 이미지 선택' : '대체 이미지 선택'}</span>하거나 드래그하여 업로드하세요
                      </div>
                      <div className="text-white/60 text-sm">
                        {form.video_url 
                          ? '권장 크기: 1280x720px (16:9), 최대 5MB'
                          : '권장 크기: 1920x1080px (16:9), 최대 5MB'}
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

              {/* 설명 및 내용 */}
              <div>
                <label className="block text-[#8B8EA0] font-medium mb-2">
                  설명
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-[#232b3d] rounded-standard border border-[#353f54] px-4 py-2.5 text-white placeholder-[#8B8EA0] focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all resize-none"
                  placeholder="프로젝트에 대한 간단한 설명을 입력하세요"
                />
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
                                setTagInput(tag.name);
                                handleAddTag();
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
                <DndProvider backend={HTML5Backend}>
                <div className="flex flex-wrap gap-4">
                  {/* 갤러리 이미지 미리보기 */}
                  {galleryImages.map((image, index) => (
                      <DraggableGalleryImage
                        key={image.id || index}
                        image={image}
                        index={index}
                        moveImage={moveGalleryImage}
                        onRemove={() => {
                          handleRemoveGalleryImage(index);
                        }}
                      />
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
                </DndProvider>

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
          <div className="flex justify-between items-center p-6 bg-[#1A2234] border-t border-[#353f54] sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
            {/* 공개설정 버튼 */}
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">공개 설정</span>
              <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleVisibilityChange('public')}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                  form.visibility === 'public'
                      ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-[#232b3d] text-gray-300 border border-[#353f54] hover:border-emerald-500/30 hover:text-emerald-400'
                }`}
              >
                <EyeIcon className="h-5 w-5" />
                  <span className="font-medium">공개</span>
              </button>
              <button
                type="button"
                onClick={() => handleVisibilityChange('private')}
                  className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                  form.visibility === 'private'
                      ? 'bg-gray-500/20 text-gray-300 border-2 border-gray-500/50 shadow-[0_0_10px_rgba(107,114,128,0.2)]'
                      : 'bg-[#232b3d] text-gray-300 border border-[#353f54] hover:border-gray-500/30'
                }`}
              >
                <EyeSlashIcon className="h-5 w-5" />
                  <span className="font-medium">비공개</span>
              </button>
              </div>
            </div>

            {/* 취소/저장 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[120px] px-6 py-3 bg-[#232b3d] text-gray-300 rounded-lg border border-[#353f54] hover:bg-[#2a344a] hover:border-gray-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="min-w-[120px] px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(37,99,235,0.2)] hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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