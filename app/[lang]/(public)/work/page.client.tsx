'use client';

import { useState, useEffect, useRef } from "react";
import { Locale } from "@/lib/i18n";
import Image from "next/image";
import ProjectModal from "@/components/projects/ProjectModal";
import { useRouter, useSearchParams } from "next/navigation";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  client: string;
  category: string;
  industry: string;
  date: string;
  visibility: string;
}

// 이미지 URL 처리 함수
function getImageUrl(url: string) {
  if (!url) return '/images/project-1.jpg';
  
  // Supabase URL 처리
  if (url.includes('supabase.co')) {
    // 이미 변환된 URL인 경우 그대로 반환
    if (url.includes('/storage/v1/object/public/')) {
      return url;
    }
    // 변환이 필요한 경우에만 변환
    const convertedUrl = url.replace('/storage/', '/storage/v1/object/public/');
    return convertedUrl;
  }
  
  // 로컬 이미지
  return url;
}

const ITEMS_PER_PAGE = 9; // 페이지당 프로젝트 수

export default function ClientPage({
  projects,
  lang,
}: {
  projects: Project[];
  lang: Locale;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("전체");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc: 최신순, asc: 오래된순
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 카테고리와 산업 목록
  const categories = ["전체", ...Array.from(new Set(projects.map(p => p.category)))];
  const industries = ["전체", ...Array.from(new Set(projects.map(p => p.industry).filter(Boolean)))];

  // URL에서 project 쿼리 파라미터를 확인
  useEffect(() => {
    const projectSlug = searchParams.get('project');
    if (projectSlug) {
      setSelectedProject(projectSlug);
    }
  }, [searchParams]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current.category && !dropdownRef.current.category.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (dropdownRef.current.industry && !dropdownRef.current.industry.contains(event.target as Node)) {
        setShowIndustryDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 카테고리 및 산업 필터링과 정렬
  useEffect(() => {
    let filtered = projects;
    
    // 카테고리 필터링
    if (selectedCategory !== "전체") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // 산업 필터링
    if (selectedIndustry !== "전체") {
      filtered = filtered.filter(p => p.industry === selectedIndustry);
    }
    
    // 날짜 정렬
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredProjects(filtered);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [selectedCategory, selectedIndustry, sortOrder, projects]);

  // 정렬 순서 토글
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // 현재 페이지의 프로젝트
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

  const openModal = (slug: string) => {
    setSelectedProject(slug);
    router.push(`/${lang}/work?project=${slug}`, { scroll: false });
  };

  const closeModal = () => {
    setSelectedProject(null);
    router.push(`/${lang}/work`, { scroll: false });
  };

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleImageError = (projectId: string) => {
    if (!failedImages.has(projectId)) {
      console.warn(`이미지 로드 실패: ${projectId}`);
      setFailedImages(prev => new Set([...prev, projectId]));
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-full mx-auto pt-16 pb-16 px-2 sm:px-4 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-[60px] md:text-[80px] font-bold text-white tracking-[.15em] leading-[1.1] mb-0 uppercase">Work</h1>
        </div>
        
        {/* 필터 섹션 */}
        <div className="flex flex-col items-center mb-6">
          {/* 필터 버튼 그룹 */}
          <div className="flex items-center gap-2">
            {/* 연도 정렬 버튼 */}
            <button
              onClick={toggleSortOrder}
              className="px-6 py-2 rounded-full text-sm transition bg-[rgba(255,255,255,0.05)] text-[#C7C7CC] hover:bg-[rgba(255,255,255,0.1)]"
            >
              YEAR {sortOrder === 'desc' ? '↓' : '↑'}
            </button>

            {/* 카테고리 드롭다운 */}
            <div className="relative" ref={(el) => { dropdownRef.current.category = el; }}>
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowIndustryDropdown(false);
                }}
                className={`px-6 py-2 rounded-full text-sm transition ${
                  selectedCategory !== "전체" || showCategoryDropdown
                    ? "bg-[rgba(203,169,103,0.1)] text-[#cba967]"
                    : "bg-[rgba(255,255,255,0.05)] text-[#C7C7CC] hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                CATEGORY {showCategoryDropdown ? '↑' : '↓'}
              </button>
              {showCategoryDropdown && (
                <div className="absolute left-0 top-full mt-2 w-48 py-2 bg-[#1a1a1a] rounded-xl border border-[rgba(255,255,255,0.1)] shadow-lg z-10">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition ${
                        selectedCategory === category
                          ? "text-[#cba967] bg-[rgba(203,169,103,0.1)]"
                          : "text-[#C7C7CC] hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 산업 드롭다운 */}
            <div className="relative" ref={(el) => { dropdownRef.current.industry = el; }}>
              <button
                onClick={() => {
                  setShowIndustryDropdown(!showIndustryDropdown);
                  setShowCategoryDropdown(false);
                }}
                className={`px-6 py-2 rounded-full text-sm transition ${
                  selectedIndustry !== "전체" || showIndustryDropdown
                    ? "bg-[rgba(203,169,103,0.1)] text-[#cba967]"
                    : "bg-[rgba(255,255,255,0.05)] text-[#C7C7CC] hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                INDUSTRY {showIndustryDropdown ? '↑' : '↓'}
              </button>
              {showIndustryDropdown && (
                <div className="absolute left-0 top-full mt-2 w-48 py-2 bg-[#1a1a1a] rounded-xl border border-[rgba(255,255,255,0.1)] shadow-lg z-10">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => {
                        setSelectedIndustry(industry);
                        setShowIndustryDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition ${
                        selectedIndustry === industry
                          ? "text-[#cba967] bg-[rgba(203,169,103,0.1)]"
                          : "text-[#C7C7CC] hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 프로젝트 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-4 md:px-6">
          {currentProjects.map((project) => (
            <div key={project.id} className="group">
              <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#050a16]">
                <div 
                  className="cursor-pointer" 
                  onClick={() => openModal(project.slug)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image 
                      src={failedImages.has(project.id) ? '/images/project-1.jpg' : getImageUrl(project.image_url)}
                      alt={project.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={currentPage === 1}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        if (!failedImages.has(project.id)) {
                          console.error(`이미지 로드 실패 [${project.title}]:`, project.image_url);
                          setFailedImages(prev => new Set([...prev, project.id]));
                        }
                      }}
                      unoptimized
                      loading={currentPage === 1 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-[#cba967] transition-colors">
                    <div 
                      className="cursor-pointer hover:text-[#cba967] transition-colors"
                      onClick={() => openModal(project.slug)}
                    >
                      {project.title}
                    </div>
                  </h3>
                  <div className="mt-3 flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-3">
                    <div className="text-sm text-white">{project.client}</div>
                    <div className="text-sm text-[#cba967]">{project.category}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {currentProjects.length === 0 && (
            <div className="col-span-full py-10 text-center">
              <p className="text-[#C7C7CC]">
                {filteredProjects.length === 0 ? "프로젝트가 없습니다." : "프로젝트를 불러오는 중에 문제가 발생했습니다."}
              </p>
            </div>
          )}
        </div>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <div className="inline-flex rounded-md">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${
                  currentPage === 1
                    ? "text-gray-medium bg-[rgba(255,255,255,0.05)]"
                    : "text-[#C7C7CC] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "text-black bg-[#cba967] hover:bg-[#d9b979]"
                      : "text-[#C7C7CC] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-medium bg-[rgba(255,255,255,0.05)]"
                    : "text-[#C7C7CC] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 프로젝트 모달 */}
      <ProjectModal 
        isOpen={selectedProject !== null}
        onClose={closeModal}
        projectSlug={selectedProject || ''}
        lang={lang}
      />
    </div>
  );
} 