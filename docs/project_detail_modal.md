# 프로젝트 상세 모달 구현 방법

프로젝트 상세 페이지를 모달 형태로 구현하여 페이지 전환 없이 컨텐츠를 표시하는 방법에 대해 설명합니다.

## 1. 모달 접근 방식

프로젝트 상세 정보를 모달로 구현하는 두 가지 주요 접근 방식이 있습니다:

### 1.1. Next.js 인터셉트 라우트 활용

Next.js 13 이상에서는 인터셉트 라우트(Intercepting Routes)를 사용하여 현재 페이지를 떠나지 않고 모달을 표시할 수 있습니다. 이 방식은 URL도 실제 페이지와 일치하기 때문에 공유나 북마크에도 적합합니다.

```tsx
// app/[lang]/(public)/work/page.tsx (기본 목록 페이지)
// app/[lang]/(public)/work/@modal/(.)project/[slug]/page.tsx (병렬 라우트로 모달 구현)
```

### 1.2. 클라이언트 사이드 모달 구현

클라이언트 측에서 상태 관리를 통해 모달을 표시하는 방식입니다. 이 경우 URL은 변경되지 않지만 구현이 더 간단합니다.

## 2. 인터셉트 라우트 구현 (권장)

### 2.1. 디렉토리 구조 설정

```
app/[lang]/(public)/work/
├── page.tsx                        // 프로젝트 목록 페이지
└── @modal/
    └── (.)project/[slug]/
        └── page.tsx                // 모달 상세 페이지
```

### 2.2. 모달 구현

```tsx
// app/[lang]/(public)/work/@modal/(.)project/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Locale } from '@/lib/i18n';
import ModalContainer from '@/components/modal/ModalContainer';
import ProjectDetail from '@/components/projects/ProjectDetail';
import RelatedProjects from '@/components/projects/RelatedProjects';

export async function generateMetadata({ 
  params: { slug, lang } 
}: { 
  params: { slug: string, lang: Locale } 
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!project) return {};

  return {
    title: `${project.title} | Bridge Makers`,
    description: project.description,
  };
}

export default async function ProjectModal({ 
  params: { slug, lang } 
}: { 
  params: { slug: string, lang: Locale } 
}) {
  const supabase = createClient();
  
  // 프로젝트 기본 정보 가져오기
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      project_images(*),
      project_tag_relations(
        project_tags(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (!project) {
    notFound();
  }

  // 관련 프로젝트 가져오기
  const { data: relatedProjects } = await supabase
    .rpc('get_related_projects', {
      project_id: project.id,
      limit_count: 3
    });

  return (
    <ModalContainer backUrl={`/${lang}/work`}>
      <ProjectDetail project={project} />
      
      {relatedProjects && relatedProjects.length > 0 && (
        <RelatedProjects projects={relatedProjects} lang={lang} />
      )}
    </ModalContainer>
  );
}
```

### 2.3. 모달 컨테이너 컴포넌트

```tsx
// components/modal/ModalContainer.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';

interface ModalContainerProps {
  children: React.ReactNode;
  backUrl: string; // 모달 닫을 때 이동할 URL
}

export default function ModalContainer({ children, backUrl }: ModalContainerProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ESC 키 또는 오버레이 클릭 시 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push(backUrl);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        router.push(backUrl);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    // 스크롤 비활성화
    document.body.style.overflow = 'hidden';

    // 모달 슬라이드 업 애니메이션
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.transform = 'translateY(0)';
        }
      }, 10);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [router, backUrl]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <div 
        ref={contentRef}
        className="w-full h-[90vh] bg-black overflow-y-auto transition-transform duration-500 ease-out"
        style={{ maxHeight: '90vh' }}
      >
        <div className="sticky top-0 right-0 z-10 flex justify-end p-4 bg-gradient-to-b from-black to-transparent">
          <button
            onClick={() => router.push(backUrl)}
            className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition"
            aria-label="닫기"
          >
            <XIcon size={24} />
          </button>
        </div>
        <div className="px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 2.4. 프로젝트 목록 페이지에서 링크 설정

```tsx
// app/[lang]/(public)/work/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';

export default function WorkPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  // ...

  return (
    <div className="bg-black min-h-screen">
      {/* ... */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 px-2 sm:px-4 md:px-6 lg:px-8">
        {projects.map((project) => (
          <div key={project.id} className="group">
            <div className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#050a16]">
              {/* 변경된 부분: 모달용 경로로 링크 변경 */}
              <Link href={`/${lang}/work/project/${project.slug}`}>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image 
                    src={project.imageUrl} 
                    alt={project.title} 
                    width={800}
                    height={450}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-5 py-2.5 bg-[#cba967] text-black font-medium rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      자세히 보기
                    </div>
                  </div>
                </div>
              </Link>
              {/* ... */}
            </div>
          </div>
        ))}
      </div>
      {/* ... */}
    </div>
  );
}
```

## 3. 클라이언트 사이드 모달 구현 (대안)

Next.js 인터셉트 라우트를 사용하지 않고 클라이언트 사이드에서만 모달을 구현하려면:

```tsx
'use client';

// components/projects/ProjectModal.tsx
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import ProjectDetail from './ProjectDetail';
import RelatedProjects from './RelatedProjects';

export default function ProjectsGrid({ projects, lang }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = async (projectId) => {
    // 여기서 프로젝트 데이터와 관련 프로젝트 데이터를 가져옴
    const response = await fetch(`/api/projects/${projectId}`);
    const data = await response.json();
    setSelectedProject(data);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => handleProjectClick(project.id)}
            className="cursor-pointer"
          >
            {/* 프로젝트 카드 내용 */}
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Content className="w-full max-w-4xl h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <ProjectDetail project={selectedProject} />
              <RelatedProjects projects={selectedProject.relatedProjects} lang={lang} />
            </>
          )}
        </Dialog.Content>
      </Dialog>
    </>
  );
}
```

## 4. 권장사항 및 고려사항

1. **인터셉트 라우트 사용 권장**: 이 방식은 URL이 실제 페이지와 일치하므로 사용자가 모달 내용을 공유하거나 북마크할 수 있습니다.

2. **성능 최적화**: 이미지는 반드시 `next/image`를 사용하여 최적화하세요.

3. **접근성**: 모달이 열리면 배경 콘텐츠에 접근할 수 없도록 `aria-hidden="true"`를 설정하고, 모달 자체에는 적절한 포커스 관리와 키보드 탐색을 제공하세요.

4. **애니메이션**: 부드러운 사용자 경험을 위해 슬라이드업 애니메이션을 구현했습니다. 필요에 따라 다른 애니메이션으로 변경할 수 있습니다. 