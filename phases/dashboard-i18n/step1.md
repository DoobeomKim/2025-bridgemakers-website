# Step 1: project-form

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 폼 구조와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/UI_GUIDE.md`
- `docs/CLAUDE.md` (루트)
- `docs/DASHBOARD.md` — 현재 구현 현황 및 미구현 항목 확인 (갤러리 이미지 미구현 확인)
- `messages/ko/dashboard.json` — step 0에서 완성된 번역 키
- `messages/en/dashboard.json`
- `components/dashboard/projects/ProjectCreateModal.tsx` — 현재 생성 폼 전체 구조
- `components/dashboard/projects/ProjectEditModal.tsx` — 현재 수정 폼 전체 구조
- `lib/projects.ts` — createProject, updateProject 시그니처
- `lib/imageUtils.ts` — uploadImageToStorage 시그니처
- `app/api/translate/route.ts` — 번역 API 요청/응답 구조
- `lib/utils.ts` — generateSlug 함수
- `lib/database.types.ts` — DB 컬럼 목록 확인

## 선행 작업: `database.types.ts` 보완

`ProjectForm`을 만들기 전에, `lib/database.types.ts`의 `projects` 테이블 타입에 아래 필드가 누락되어 있으면 추가한다:

```typescript
// projects Row / Insert / Update 모두에 추가
service?: string;
is_featured?: boolean;
```

이미 있다면 건너뛴다.

## 작업

`components/dashboard/projects/ProjectForm.tsx`를 새로 만들어라.  
이 컴포넌트는 생성·수정 양쪽에서 재사용되는 단일 폼이다.

> **참고**: 기존 코드(`ProjectCreateModal`, `ProjectEditModal`)에서 갤러리 이미지는 UI만 있고 실제로 `project_images` 테이블에 저장되지 않았다(`DASHBOARD.md` — "갤러리 이미지 관리: 미구현"). 이 컴포넌트에서 처음으로 완전하게 구현한다.

### Props 인터페이스

```typescript
interface ProjectFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  locale: Locale;
  translations: Record<string, any>; // messages/{locale}/dashboard.json의 projectForm 키
}

interface ProjectFormData {
  // 공통 (영어 단일)
  client: string;
  country: string;
  date: string;
  service: string;
  slug: string;
  visibility: 'public' | 'private';
  is_featured: boolean;
  image_url: string;          // 썸네일 URL (업로드 완료 후)
  gallery_images: string[];   // 갤러리 이미지 URL 배열 (업로드 완료 후)
  video_url: string;
  video_thumbnail_url: string;
  tags: string[];             // 태그 이름 배열 — ID 변환은 onSubmit 호출측에서 처리

  // 한국어
  title: string;
  description: string;
  content: string;
  category: string;
  industry: string;

  // 영어
  title_en: string;
  description_en: string;
  content_en: string;
  category_en: string;
  industry_en: string;

  translation_status: 'pending' | 'translated' | 'reviewed';
}
```

> **`tags`**: 이 컴포넌트는 태그를 이름 문자열로만 다룬다. 이름→ID 변환 및 `project_tag_relations` 저장은 step 2/3의 `handleSubmit`에서 처리한다.

> **`gallery_images`**: 이 컴포넌트 내부에서 파일을 업로드하고 URL 배열로 변환한 뒤 `onSubmit` 데이터에 포함한다. `project_images` 테이블 insert는 step 2/3의 `handleSubmit`에서 처리한다.

### 레이아웃 구조

아래 섹션 순서로 렌더링하라:

**섹션 1 — 공통 정보 (단일 컬럼)**
- 클라이언트명 (영어 입력, placeholder: "e.g. Hyundai Motor")
- 국가 (영어 입력, placeholder: "e.g. Germany")
- 날짜, 서비스 유형 (2열 그리드)

**섹션 2 — 이중언어 콘텐츠 (2컬럼 분할)**

```
┌─────────────────────┬─────────────────────┐
│  🇰🇷 한국어 (KO)     │  🇺🇸 영어 (EN)       │
├─────────────────────┼─────────────────────┤
│ 제목                 │ Title               │
│ [input]             │ [input]             │
│ 카테고리             │ Category            │
│ [input]             │ [input]             │
│ 산업                 │ Industry            │
│ [input]             │ [input]             │
│ 설명                 │ Description         │
│ [textarea rows=3]   │ [textarea rows=3]   │
│ 내용                 │ Content             │
│ [textarea rows=6]   │ [textarea rows=6]   │
├─────────────────────┼─────────────────────┤
│ [🤖 → 영어 자동번역] │ [🤖 → 한국어 자동번역]│
└─────────────────────┴─────────────────────┘
```

- 데스크탑: `grid grid-cols-2 gap-6`
- 모바일 (`md` 미만): 한국어 컬럼 → 영어 컬럼 순서로 세로 스택 (`grid-cols-1`)
- 각 컬럼 헤더는 고정 (`sticky top-0`)이 아닌 섹션 제목으로만 표시

**번역 버튼 동작:**
- `[🤖 → 영어]`: KO 5개 필드(title, category, industry, description, content)를 순서대로 `/api/translate` (targetLang: EN)에 요청 → EN 필드 채움
- `[🤖 → 한국어]`: EN 5개 필드를 `/api/translate` (targetLang: KO)에 요청 → KO 필드 채움
- 번역 중: 해당 버튼 스피너, 반대쪽 버튼 disabled
- 번역 후 `translation_status`를 `'translated'`로 업데이트
- 번역 API 실패 시 인라인 에러 메시지 표시 (`alert()` 금지)

**섹션 3 — URL 슬러그**
- 슬러그 입력 필드 + 재생성 버튼
- 제목(한국어) 필드 blur 시 자동생성 로직: DeepL KO→EN 번역 후 generateSlug 호출
- `mode === 'edit'`이고 `initialData.slug`가 있으면 자동 덮어쓰기 금지

**섹션 4 — 미디어**
- 썸네일 업로드 (드래그앤드롭 + 클릭): 업로드 완료 시 `image_url` 세팅
- 갤러리 이미지 (DraggableGalleryImage + GalleryDropZone 재사용): 업로드 완료 시 `gallery_images` 배열에 추가
  - `mode === 'edit'`이고 `initialData.gallery_images`가 있으면 기존 이미지 목록으로 초기화
- 비디오 URL 입력

**섹션 5 — 태그 (영어 단일)**
- 태그 검색 + 생성 (기존 로직 유지)
- 태그는 영어로만 입력하도록 placeholder: "e.g. gamescom, Trade Fair Video"
- 내부적으로 태그 이름 문자열만 관리한다. ID 처리는 상위 컴포넌트 책임.

**섹션 6 — 설정**
- 공개/비공개 라디오
- 추천 프로젝트 체크박스
- DeepL API 사용량 표시 (번역 버튼 근처)

**섹션 7 — 액션 버튼 (하단 sticky)**
- 취소 / 저장 버튼
- `saving` 상태일 때 스피너

### 핵심 설계 규칙

- 이 컴포넌트는 `'use client'`이다.
- 이미지 업로드(썸네일, 갤러리)는 이 컴포넌트 내부에서 직접 처리하고, 최종 URL만 `onSubmit` 데이터에 포함시킨다. `onSubmit` 호출측은 URL만 받으면 된다.
- `onSubmit`에서 `project_images` 테이블 처리를 하지 않는다. 그것은 step 2/3의 책임이다.
- 번역 API 실패 시 에러 메시지를 해당 버튼 아래에 인라인으로 표시한다. `alert()`를 쓰지 마라.
- `mode === 'edit'`이고 `initialData`가 주어지면, 마운트 시 해당 데이터로 폼을 초기화한다.

## Acceptance Criteria

```bash
npm run build   # 타입 에러 없음
npm run lint    # 린트 통과
```

추가 확인:
- `ProjectForm`이 `mode="create"`로 렌더링될 때 모든 필드가 비어있다.
- `ProjectForm`이 `mode="edit"`으로 `initialData`와 함께 렌더링될 때 필드에 기존 데이터가 채워진다.
- 2컬럼 레이아웃이 `md` 브레이크포인트 이상에서 나타난다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. `phases/dashboard-i18n/index.json`의 step 1을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "ProjectForm.tsx 생성 완료 — 2컬럼 이중언어 레이아웃, 양방향 번역 버튼, gallery_images, mode props"`

## 금지사항

- `ProjectCreateModal.tsx`, `ProjectEditModal.tsx`는 이 step에서 수정하지 마라. step 2, 3에서 처리한다.
- `alert()`를 사용하지 마라. 인라인 에러 상태로 처리하라.
- `window.location.href`로 페이지 이동하지 마라. `onCancel` prop을 호출하라.
