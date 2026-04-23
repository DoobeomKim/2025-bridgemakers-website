# Bridgemakers 웹사이트

Next.js 14 기반 크리에이티브 에이전시 포트폴리오 웹사이트. Supabase 인증·DB, DeepL 번역, Claude AI를 활용한 다국어 콘텐츠 관리 시스템이 구현되어 있습니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Database / Auth**: Supabase (Auth Helpers for Next.js)
- **i18n**: next-intl — ko / en / de
- **번역 API**: DeepL API
- **AI**: Anthropic Claude (포트폴리오 소개 문구 자동 다듬기)
- **Deployment**: Vercel (`https://ibridgemakers.de`)

## 주요 기능

- Supabase 이메일 인증 (OTP 방식)
- 관리자 전용 프로젝트 대시보드
- 프로젝트 생성·수정 (썸네일·갤러리 이미지 업로드, 태그 관리)
- DeepL 기반 한↔영 자동 번역
- Claude AI 기반 요약 설명 자동 정리 (`/api/ai-polish`)
- 서비스·카테고리·산업 분야 DB 기반 자동완성 Combobox
- 슬러그 자동 생성 (영문 번역 → URL-safe 변환)
- 공개 포트폴리오 페이지 (Work, 프로젝트 상세)
- Contact Us 문의 폼 + 이메일 알림

## 환경 변수

`.env.local` 파일에 아래 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 사이트 URL
NEXT_PUBLIC_SITE_URL=https://ibridgemakers.de

# DeepL 번역 API
DEEPL_API_KEY=your-deepl-api-key

# Anthropic Claude AI (프로젝트 소개 문구 자동 정리)
ANTHROPIC_API_KEY=sk-ant-...

# 이메일 (문의 알림)
RESEND_API_KEY=your-resend-api-key
NOTIFICATION_EMAIL=your@email.com
```

> `ANTHROPIC_API_KEY` 미설정 시 AI 내용 정리 버튼이 503 에러를 반환합니다.

## 개발 서버 실행

```bash
npm run dev    # localhost:3000
npm run build  # 프로덕션 빌드 확인
npm run start  # 프로덕션 서버
```

## 프로젝트 구조

```
app/
  [lang]/
    (public)/       # 공개 페이지 (work, contact, services 등)
    dashboard/      # 관리자 대시보드
      projects/
        new/        # 프로젝트 생성 페이지
        [id]/       # 프로젝트 수정 페이지
  api/
    ai-polish/      # Claude AI 소개 문구 정리
    translate/      # DeepL 번역
    upload-image/   # Supabase Storage 이미지 업로드

components/
  dashboard/
    projects/
      ProjectForm.tsx         # 공용 프로젝트 폼 (생성·수정 공통)
      ProjectCreatePage.tsx   # 생성 페이지 래퍼
      ProjectEditWrapper.tsx  # 수정 페이지 래퍼
  auth/
  shared/

lib/
  projects.ts     # Supabase 프로젝트 CRUD
  supabase.ts     # Supabase 클라이언트
  i18n.ts         # 다국어 설정
  utils.ts        # 유틸 (슬러그 생성 등)

messages/
  ko/dashboard.json
  en/dashboard.json
```

## 대시보드 개발 이력

### 2025-04 dashboard-i18n 작업

**번역 파일 연동**
- `messages/ko/dashboard.json`, `messages/en/dashboard.json` 구조 정의
- DashboardHeader, DashboardSidebar, ProjectsClient에 translations props 적용
- 하드코딩 한국어 → 번역 키 기반 다국어 처리

**프로젝트 생성·수정 페이지 전환**
- 기존 모달 오버레이 → 풀 페이지 라우팅 방식으로 전환
  - `app/[lang]/dashboard/projects/new/page.tsx` 신규
  - `components/dashboard/projects/ProjectCreatePage.tsx` 신규
  - `ProjectEditWrapper.tsx` 모달 제거 후 인라인 폼으로 재작성
- 모달 `overflow-hidden` + `fixed inset-0` 조합으로 발생하던 스크롤 불가 문제 해결

**ProjectForm UX 개선**
- 기본 정보 섹션에 영어 입력 권장 안내 (`basicInfoNote`) 추가
- 서비스·카테고리·산업 분야 → headlessui `Combobox` 기반 자동완성 (`SuggestCombobox`)
  - DB에 저장된 기존 값 자동 로드 후 드롭다운 제공
  - 없는 값은 직접 입력 가능
- 요약 설명 필드에 ✨ AI 내용 정리 버튼 추가 (한/영 각각)
  - `/api/ai-polish` POST 엔드포인트 신규 — Claude Haiku 모델 사용
  - 클라이언트명·국가·제목·카테고리 컨텍스트를 함께 전달해 정확도 향상
  - `ANTHROPIC_API_KEY` 환경 변수 필요

**버그 수정**
- DB에 없는 컬럼(`is_featured`, `category_en` 등) 전달 시 프로젝트 수정 400 에러 수정
  - `lib/projects.ts`에 `PROJECT_COLUMNS` 허용 목록 기반 `filterProjectFields()` 추가
  - `createProject` / `updateProject` 에서 미존재 컬럼 자동 제거
- `fetchSuggestions` fallback 처리 — EN 컬럼 미존재 시 기본 컬럼만으로 재시도

**다국어 제목 표시 (locale-aware)**
- 대시보드 프로젝트 리스트: EN 페이지에서 `title_en` 우선, 없으면 `title` fallback
- `/work` 공개 페이지: `title_en`, `description_en`, `category_en` 쿼리에 추가
  - async/await 전환 + EN 컬럼 미존재 시 기본 컬럼 fallback (페이지 안 깨짐)
- 홈 페이지 프로젝트 섹션: `title_en` / `category_en` locale에 맞게 우선 표시

**프로젝트 목록 UX 개선 (2026-04-22 오후)**
- `ProjectsTableRow` 썸네일 hover 시 Work 공개 페이지 바로가기 오버레이 추가
  - `/{locale}/work/project/{slug}` 새 탭으로 이동
  - 슬러그 없는 프로젝트는 오버레이 미표시
- AI 내용 정리 버튼 라벨 이모지(`✨`) 제거 — `SparklesIcon`으로 통일

> **DB 마이그레이션 필요** — 아래 SQL을 Supabase SQL Editor에서 실행해야 영문 필드가 완전히 동작합니다:
> ```sql
> ALTER TABLE projects
>   ADD COLUMN IF NOT EXISTS service TEXT,
>   ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
>   ADD COLUMN IF NOT EXISTS title_en TEXT,
>   ADD COLUMN IF NOT EXISTS description_en TEXT,
>   ADD COLUMN IF NOT EXISTS content_en TEXT,
>   ADD COLUMN IF NOT EXISTS category_en TEXT,
>   ADD COLUMN IF NOT EXISTS industry_en TEXT,
>   ADD COLUMN IF NOT EXISTS video_thumbnail_url TEXT,
>   ADD COLUMN IF NOT EXISTS translation_status TEXT NOT NULL DEFAULT 'pending';
> ```

## 배포

Vercel에 자동 배포됩니다. `main` 브랜치 push 시 프로덕션(`ibridgemakers.de`) 배포.

자세한 배포 절차는 [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) 참조.
