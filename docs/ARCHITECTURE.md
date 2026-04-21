# ARCHITECTURE — Bridgemakers Website

## 디렉토리 구조

```
webfolder/
├── app/
│   ├── [lang]/                    # 언어별 라우팅 (ko / en / de)
│   │   ├── (auth)/               # 인증 관련 라우트 (login, register)
│   │   ├── (dashboard)/          # 관리자 대시보드 (overview, projects, settings)
│   │   ├── (public)/             # 공개 페이지 (about, contact, portfolio)
│   │   ├── page.tsx              # 메인(홈) 페이지
│   │   └── layout.tsx
│   ├── api/                      # API 라우트 핸들러 (모든 서버 로직은 여기서)
│   │   ├── auth/
│   │   └── dashboard/
│   └── layout.tsx
├── components/
│   ├── ui/                       # ShadCN 기반 재사용 UI 컴포넌트
│   ├── admin/                    # 관리자 전용 컴포넌트
│   ├── shared/                   # 공통 컴포넌트 (header, footer, language-switcher)
│   └── layouts/                  # 레이아웃 컴포넌트
├── lib/
│   ├── supabase/                 # Supabase 클라이언트 (client.ts / server.ts)
│   ├── i18n/                     # i18n 유틸리티
│   └── utils/                    # 공통 유틸리티
├── messages/                     # 번역 파일 (ko / en / de)
├── types/                        # TypeScript 타입 정의
├── public/                       # 정적 파일
├── styles/                       # 전역 스타일
├── docs/                         # 프로젝트 문서 (이 파일 포함)
├── scripts/                      # 자동화 스크립트 (execute.py 등)
└── phases/                       # Harness 실행 단계 파일
```

## 기술 스택

| 영역 | 기술 |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS |
| DB / Auth | Supabase (PostgreSQL + Auth Helpers) |
| Storage | Supabase Storage (프로젝트 이미지) |
| Deployment | Vercel |
| i18n | next-intl |
| Animation | Framer Motion, GSAP |
| UI Library | ShadCN, Headless UI, Radix UI |

## 컴포넌트 설계 원칙

- **Server Components 기본**: 데이터 페칭, SEO, 초기 렌더링은 서버에서
- **Client Components**: `'use client'` 선언 필수. 인터랙션, 브라우저 API, 실시간 상태 관리에만 사용
- **동적 임포트 패턴**: 브라우저 API 의존 컴포넌트는 `next/dynamic + ssr: false`로 래핑

```typescript
// 패턴 예시
const ClientComponent = dynamic(() => import('./ClientComponent'), { ssr: false });
```

## 데이터 흐름

```
User Input
  → Client Component (이벤트 처리)
  → app/api/ Route Handler (서버 검증 + DB 작업)
  → Supabase PostgreSQL
  → Response → UI 업데이트
```

- 직접 DB 접근: 서버 컴포넌트 또는 API 라우트에서만 허용
- 클라이언트에서 Supabase 직접 호출: 인증 상태 변경에 한해 허용 (`createClientComponentClient`)

## 인증 시스템

### 구성 요소

| 컴포넌트 | 역할 |
|---|---|
| `AuthProvider` (서버) | 서버에서 초기 세션 확인, ClientAuthProvider에 전달 |
| `ClientAuthProvider` (클라이언트) | 실시간 인증 상태 구독, Context 제공 |
| `middleware.ts` | 세션 갱신, 보호된 라우트 접근 제어 |
| `lib/supabase/server.ts` | 서버용 Supabase 클라이언트 |
| `lib/supabase/client.ts` | 클라이언트용 Supabase 클라이언트 |

### 인증 흐름

1. 초기 로드: `RootLayout`에서 서버 세션 확인 → `AuthProvider` 초기화
2. 로그인: OAuth(Google) 또는 이메일+OTP → Supabase 세션 생성 → 프로필 조회/생성
3. 세션 유지: HttpOnly 쿠키, 미들웨어에서 자동 갱신
4. 로그아웃: 세션 삭제 + 클라이언트 상태 초기화

### Supabase 클라이언트 사용 규칙

```typescript
// 서버 컴포넌트 / API 라우트
import { createServerClient } from '@/lib/supabase/server';

// 클라이언트 컴포넌트
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// 미들웨어
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
```

## 데이터베이스 스키마 (주요 테이블)

| 테이블 | 역할 |
|---|---|
| `users` | 사용자 프로필 (id, email, first_name, last_name, user_level) |
| `projects` | 포트폴리오 프로젝트 (title, slug, description, category, client, image_url, is_featured) |
| `project_images` | 프로젝트 갤러리 이미지 (project_id FK, image_url, sort_order) |
| `project_tags` | 태그 목록 (name, slug) |
| `project_tag_relations` | 프로젝트-태그 다대다 관계 |
| `contact_inquiries` | 문의 내역 |

- 모든 테이블에 Row Level Security (RLS) 적용
- `projects` 조회: `get_related_projects()` 함수로 관련 프로젝트 동적 추천

## 다국어 라우팅

- URL 구조: `/{lang}/path` (lang = ko | en | de)
- 번역 파일: `messages/{lang}/common.json`, `auth.json`, `dashboard.json` 등
- params 처리: 서버 컴포넌트에서 `React.use(Promise.resolve(params))`

## 상태 관리

- **서버 상태**: Server Components에서 직접 데이터 페칭
- **인증 상태**: React Context (`AuthContext`) — 앱 전체 공유
- **UI 상태**: 각 컴포넌트 로컬 `useState` / `useReducer`
- **세션 캐싱**: SessionStorage를 활용해 불필요한 DB 조회 최소화
