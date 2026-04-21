# Bridgemakers Website — 프로젝트 규칙

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database / Auth**: Supabase (Auth Helpers for Next.js)
- **Deployment**: Vercel (`https://ibridgemakers.de`)
- **i18n**: next-intl, 지원 언어 ko / en / de

## CRITICAL 규칙

아래 규칙은 어떤 경우에도 위반하지 마라.

1. **모든 API 로직은 `app/api/` 라우트 핸들러에서만 처리한다.** 클라이언트 컴포넌트에서 외부 API를 직접 호출하지 마라.
2. **Supabase 서버 클라이언트는 서버 컴포넌트/API 라우트에서만 생성한다.** 클라이언트 컴포넌트에서는 반드시 `createClientComponentClient()`를 사용한다.
3. **동적 라우트 params는 `React.use(Promise.resolve(params))`로 처리한다.** 직접 접근하면 Next.js 경고/에러가 발생한다.
4. **`'use client'` 컴포넌트에서 브라우저 API(`window`, `localStorage` 등)를 사용할 때는 `next/dynamic`의 `ssr: false`로 래핑한다.**
5. **환경변수 `NEXT_PUBLIC_SITE_URL`은 반드시 `https://ibridgemakers.de`로 설정한다.** 동적 URL 생성 함수를 사용하고 하드코딩하지 마라.

## 아키텍처 규칙

- **Server Components 기본**, 인터랙션이 필요한 경우에만 Client Component 사용
- 컴포넌트는 `components/` 폴더에, 타입은 `types/` 폴더에, 유틸은 `lib/` 폴더에 위치
- 외부 서비스 연동 로직(Supabase queries 등)은 `lib/` 또는 `app/api/` 에서만 처리
- 번역 파일은 `messages/{lang}/` 디렉토리에 JSON으로 관리

## 개발 프로세스

- 커밋 컨벤션: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` 접두사 사용
- 버전 관리: Semantic Versioning (MAJOR.MINOR.PATCH)
  - MAJOR: 구조/기능의 비호환 변경
  - MINOR: 하위 호환 새 기능 추가
  - PATCH: 버그 수정, 사소한 UI 수정

## 사용 가능한 커맨드

```bash
npm run dev    # 개발 서버 실행 (localhost:3000)
npm run build  # 프로덕션 빌드
npm run start  # 프로덕션 서버 실행
npm run lint   # ESLint 검사
```

## 프로젝트 정보

- **프로젝트명**: Bridgemakers Website
- **서비스 도메인**: `https://ibridgemakers.de`
- **Supabase 프로젝트**: Auth + DB (PostgreSQL)
- **주요 테이블**: `users`, `projects`, `project_images`, `project_tags`, `project_tag_relations`, `contact_inquiries`
