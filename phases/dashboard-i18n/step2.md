# Step 2: create-refactor

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 구조를 파악하라:

- `docs/DASHBOARD.md` — 현재 구현 현황 (갤러리 미구현, project_images 테이블 구조 확인)
- `components/dashboard/projects/ProjectCreateModal.tsx` — 리팩터링 대상 전체 코드
- `components/dashboard/projects/ProjectForm.tsx` — step 1에서 생성한 공유 폼
- `lib/projects.ts` — createProject, getAllTags, createTag, linkTagsToProject 시그니처
- `lib/database.types.ts` — project_images Insert 타입 확인
- `messages/ko/dashboard.json` — projectForm 번역 키
- `messages/en/dashboard.json`
- `lib/i18n/index.ts` — getTranslations, Locale 타입

## 작업

`components/dashboard/projects/ProjectCreateModal.tsx`를 리팩터링하라.  
기존 인라인 폼 로직을 제거하고 `ProjectForm`을 사용하는 얇은 래퍼(thin wrapper)로 만들어라.

### 목표 구조

```tsx
export default function ProjectCreateModal({ isOpen, onClose, onSuccess, locale }: ProjectCreateModalProps) {
  const t = /* messages/{locale}/dashboard.json의 projectForm 섹션 */;

  const handleSubmit = async (data: ProjectFormData) => {
    // 1. 태그 이름 → ID 변환
    // 2. createProject 호출
    // 3. project_images 테이블 insert (gallery_images)
    // 4. linkTagsToProject 호출
    // 5. onSuccess() → onClose()
  };

  if (!isOpen) return null;

  return (
    <div> {/* 모달 오버레이 + 컨테이너 */}
      <ProjectForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={onClose}
        locale={locale}
        translations={t}
      />
    </div>
  );
}
```

### 세부 지침

**1. 모달 오버레이 유지**  
기존 배경 오버레이(`fixed inset-0 bg-black/50 z-50`), ESC 키 닫기, 스크롤 잠금(`document.body.style.overflow`) 로직은 그대로 유지한다.

**2. 번역 로드**  
클라이언트 컴포넌트이므로 `getTranslations()` 대신 조건부 import를 사용한다:

```typescript
import koMessages from '@/messages/ko/dashboard.json';
import enMessages from '@/messages/en/dashboard.json';
const t = locale === 'ko' ? koMessages.projectForm : enMessages.projectForm;
```

**3. 태그 이름 → ID 변환**  
`ProjectForm`에서 받은 `data.tags`는 태그 이름 배열이다. 저장 전에 ID로 변환해야 한다:

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

**4. `createProject` 호출 — 필드 매핑**  
기존 `ProjectCreateModal`은 내부 state에서 `isPublic`, `videoUrl` 같은 camelCase 필드를 사용했다. `ProjectForm`의 `ProjectFormData`는 DB 컬럼명(`visibility`, `video_url`)을 직접 사용하므로 별도 변환 없이 그대로 넘긴다:

```typescript
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
  // client_en, country_en은 저장하지 않는다 (영어 단일 필드)
});
if (!result.success || !result.data) throw new Error(result.error || '프로젝트 생성 실패');
```

**5. `project_images` 테이블 insert (갤러리 이미지 — 최초 구현)**  
기존 코드는 갤러리 이미지를 저장하지 않았다. 이번에 처음으로 구현한다:

```typescript
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
```

`supabase`는 `createClientComponentClient()`로 생성한다.

**6. 태그 연결**  
```typescript
if (tagIds.length > 0) {
  await linkTagsToProject(result.data.id, tagIds);
}
```

**7. 성공 처리**  
```typescript
onSuccess();
onClose();
```

**8. 에러 처리**  
인라인 에러 상태(`useState<string | null>`)로 처리한다. `alert()` 금지.

**9. 제거할 것**  
기존 인라인 폼 JSX(input, textarea, 번역 버튼, 이미지 업로드 UI, 태그 Combobox 등) 전부 제거. `ProjectForm`으로 대체.

## Acceptance Criteria

```bash
npm run build   # 타입 에러 없음
npm run lint    # 린트 통과
```

추가 확인:
- `ProjectCreateModal`이 열릴 때 `ProjectForm`이 `mode="create"`로 렌더링된다.
- 저장 성공 시 `onSuccess`와 `onClose`가 호출된다.
- 갤러리 이미지가 `project_images` 테이블에 저장된다.
- ESC 키로 모달이 닫힌다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. `phases/dashboard-i18n/index.json`의 step 2를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ProjectCreateModal 리팩터링 완료 — ProjectForm 래퍼, project_images 저장, 태그 ID 변환"`

## 금지사항

- `ProjectCreateModalProps` 인터페이스를 변경하지 마라. 기존 사용처(`ProjectsClient.tsx`)가 깨진다.
- `ProjectForm.tsx`를 이 step에서 수정하지 마라.
- `alert()`를 사용하지 마라.
- `client_en`, `country_en`을 DB에 저장하지 마라. 이 필드들은 영어 단일 필드(`client`, `country`)로 대체된다.
