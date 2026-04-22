# Step 3: edit-refactor

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 구조를 파악하라:

- `docs/DASHBOARD.md` — 수정 페이지 구현 현황, 갤러리 미구현 확인
- `components/dashboard/projects/ProjectEditModal.tsx` — 리팩터링 대상 전체 코드
- `components/dashboard/projects/ProjectEditWrapper.tsx` — 라우트 래퍼
- `components/dashboard/projects/ProjectForm.tsx` — step 1에서 생성한 공유 폼
- `lib/projects.ts` — updateProject, getAllTags, createTag, linkTagsToProject 시그니처
- `lib/database.types.ts` — project_images Insert/Update 타입 확인
- `app/[lang]/dashboard/projects/[id]/edit/page.tsx` (또는 `[id]/page.tsx`) — 현재 edit 라우트

## 작업

`components/dashboard/projects/ProjectEditModal.tsx`를 리팩터링하라.  
기존 인라인 폼 로직을 제거하고 `ProjectForm`을 사용하는 얇은 래퍼로 만들어라.

### 목표 구조

```tsx
export default function ProjectEditModal({ isOpen, onClose, onSuccess, locale, projectId }: ProjectEditModalProps) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const t = /* messages/{locale}/dashboard.json의 projectForm 섹션 */;

  useEffect(() => {
    if (isOpen && projectId) loadProject();
  }, [isOpen, projectId]);

  const handleSubmit = async (data: ProjectFormData) => {
    // 1. 태그 이름 → ID 변환
    // 2. updateProject 호출
    // 3. project_images 테이블 교체 (기존 삭제 → 새로 insert)
    // 4. 태그 재연결
    // 5. onSuccess() → onClose()
  };

  if (!isOpen) return null;

  return (
    <div> {/* 모달 오버레이 + 컨테이너 */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ProjectForm
          mode="edit"
          initialData={mapProjectToFormData(project!)}
          onSubmit={handleSubmit}
          onCancel={onClose}
          locale={locale}
          translations={t}
        />
      )}
    </div>
  );
}
```

### 세부 지침

**1. 모달 오버레이 유지**  
기존 배경 오버레이, ESC 키 닫기, 스크롤 잠금 로직 그대로 유지.

**2. 번역 로드**  
```typescript
import koMessages from '@/messages/ko/dashboard.json';
import enMessages from '@/messages/en/dashboard.json';
const t = locale === 'ko' ? (koMessages as any).projectForm : (enMessages as any).projectForm;
```

**3. 데이터 fetch — `project_images` 포함**  
기존 Supabase 쿼리에 `project_images`가 이미 포함되어 있는지 확인한다. 없다면 추가한다:

```typescript
const { data, error } = await supabase
  .from('projects')
  .select(`*, project_tag_relations(project_tags(id, name)), project_images(id, image_url, sort_order)`)
  .eq('id', projectId)
  .single();
```

**4. `mapProjectToFormData` — 컴포넌트 외부 순수 함수**  

```typescript
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
      ?.map((r: any) => r.project_tags?.name).filter(Boolean) || [],
    translation_status: (project.translation_status as any) || 'pending',
  };
}
```

**5. 태그 이름 → ID 변환 (step 2와 동일 패턴)**  
```typescript
const allTags = await getAllTags();
const tagIds = await Promise.all(
  data.tags.map(async (name) => {
    const existing = allTags.find(t => t.name === name);
    if (existing) return existing.id;
    const result = await createTag({ name, slug: name.toLowerCase().replace(/\s+/g, '-') });
    if (!result.success || !result.data) throw new Error(`태그 생성 실패: ${name}`);
    return result.data.id;
  })
);
```

**6. `updateProject` 호출**  
```typescript
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
  // client_en, country_en은 저장하지 않는다
  tags: tagIds, // updateProject 내부에서 tag_relations 처리
});
if (!updated) throw new Error('프로젝트 수정 실패');
```

**7. `project_images` 교체 (기존 삭제 → 새로 insert)**  
수정 시 갤러리 이미지를 완전히 교체한다:

```typescript
// 기존 이미지 전체 삭제
await supabase.from('project_images').delete().eq('project_id', projectId);

// 새 이미지 insert
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
```

**8. 슬러그 보호**  
`ProjectForm`의 `mode="edit"` + `initialData.slug` 조합으로 자동 처리됨. 별도 로직 불필요.

**9. 에러 처리**  
인라인 에러 상태(`useState<string | null>`)로 처리한다. `alert()` 금지.

**10. 제거할 것**  
기존 인라인 폼 JSX 전부 제거. `ProjectForm`으로 대체.

## Acceptance Criteria

```bash
npm run build   # 타입 에러 없음
npm run lint    # 린트 통과
```

추가 확인:
- `ProjectEditModal`이 열릴 때 기존 프로젝트 데이터가 `ProjectForm` 필드에 채워진다.
- 갤러리 이미지가 기존 순서대로 로드된다.
- 수정 저장 시 `project_images` 테이블이 갱신된다.
- `mode="edit"`에서 슬러그 자동 덮어쓰기가 발생하지 않는다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. `phases/dashboard-i18n/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ProjectEditModal 리팩터링 완료 — ProjectForm 래퍼, project_images 교체, 태그 ID 변환, initialData 매핑"`

## 금지사항

- `ProjectEditModalProps` 인터페이스를 변경하지 마라.
- `ProjectForm.tsx`를 이 step에서 수정하지 마라.
- `alert()`를 사용하지 마라.
- `client_en`, `country_en`을 DB에 저장하지 마라.
