# Step 0: translation-json

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트 구조와 현재 번역 상태를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/CLAUDE.md` (루트의 CLAUDE.md)
- `messages/ko/dashboard.json` — 현재 번역 키 확인
- `messages/en/dashboard.json` — 현재 번역 키 확인
- `app/[lang]/dashboard/components/DashboardSidebar.tsx` — 어떤 키를 사용하는지
- `app/[lang]/dashboard/components/DashboardHeader.tsx`
- `app/[lang]/dashboard/projects/ProjectsClient.tsx`

## 작업

`messages/ko/dashboard.json`과 `messages/en/dashboard.json` 두 파일을 아래 키 구조로 교체하라.

### 키 구조 (두 파일 동일 구조, 값만 언어별로 다름)

```json
{
  "dashboard": "...",
  "welcome": "...",
  "userLevel": "...",
  "admin": "...",
  "premium": "...",
  "basic": "...",
  "profile": "...",
  "projects": "...",
  "settings": "...",
  "site_management": "...",
  "logout": "...",

  "projectList": {
    "title": "...",
    "newProject": "...",
    "search": "...",
    "deleteSelected": "...",
    "visibilityChange": "...",
    "makePublic": "...",
    "makePrivate": "...",
    "selected": "... selected",
    "loading": "...",
    "noPermission": "..."
  },

  "projectForm": {
    "createTitle": "...",
    "editTitle": "...",
    "save": "...",
    "saving": "...",
    "cancel": "...",
    "backToList": "...",

    "sections": {
      "basicInfo": "...",
      "koreanContent": "...",
      "englishContent": "...",
      "media": "...",
      "tags": "...",
      "settings": "..."
    },

    "fields": {
      "client": "...",
      "clientPlaceholder": "...",
      "country": "...",
      "countryPlaceholder": "...",
      "date": "...",
      "service": "...",
      "servicePlaceholder": "...",
      "title": "...",
      "titlePlaceholder": "...",
      "description": "...",
      "descriptionPlaceholder": "...",
      "content": "...",
      "contentPlaceholder": "...",
      "category": "...",
      "categoryPlaceholder": "...",
      "industry": "...",
      "industryPlaceholder": "...",
      "slug": "...",
      "slugPlaceholder": "...",
      "slugHint": "...",
      "visibility": "...",
      "visibilityPublic": "...",
      "visibilityPrivate": "...",
      "isFeatured": "...",
      "thumbnail": "...",
      "thumbnailHint": "...",
      "gallery": "...",
      "videoUrl": "...",
      "videoUrlPlaceholder": "...",
      "tags": "...",
      "tagPlaceholder": "...",
      "newTag": "..."
    },

    "translate": {
      "toEnglish": "...",
      "toKorean": "...",
      "translating": "...",
      "success": "...",
      "error": "...",
      "slugGenerating": "...",
      "slugManualHint": "...",
      "regenerateSlug": "..."
    }
  }
}
```

### 값 작성 기준

- `ko`: 자연스러운 한국어
- `en`: 자연스러운 영어 (관리자 대시보드 맥락)
- placeholder 값은 실제 입력 예시가 들어가면 좋음 (예: `en.projectForm.fields.clientPlaceholder` → `"e.g. Hyundai Motor"`)

## Acceptance Criteria

```bash
npm run build   # 타입 에러 없음
```

JSON 파일은 빌드 단계에서 타입 검사를 받지 않으므로, 아래를 직접 확인하라:
- `messages/ko/dashboard.json` — 유효한 JSON, 위 키 구조 포함
- `messages/en/dashboard.json` — 유효한 JSON, 위 키 구조 포함
- 기존 키 (`dashboard`, `welcome`, `userLevel`, `admin`, `premium`, `basic`) 는 반드시 유지

## 검증 절차

1. 두 JSON 파일이 동일한 키 구조를 가지는지 확인한다.
2. 기존 키가 누락되지 않았는지 확인한다.
3. `phases/dashboard-i18n/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "messages/ko|en/dashboard.json 확장 완료 — projectForm, projectList 네임스페이스 추가"`

## 금지사항

- `messages/` 디렉토리 밖의 파일은 건드리지 마라. 이 step은 번역 데이터만 다룬다.
- 기존 키를 삭제하거나 이름을 바꾸지 마라. 이미 사용 중인 컴포넌트가 있다.
