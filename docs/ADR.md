# ADR — Architecture Decision Records

## 철학

MVP 속도 우선, 외부 의존성 최소화, 검증된 최소 구현 선택.

---

## ADR-001: 인증 시스템 — Supabase Auth 선택

**결정**: Clerk 대신 Supabase Auth를 인증 시스템으로 사용한다.

**이유**:
- Supabase DB와 동일 플랫폼으로 통합 관리 가능 (별도 서비스 추가 불필요)
- `@supabase/auth-helpers-nextjs`가 Next.js App Router와 긴밀하게 통합됨
- 이메일+OTP, Google OAuth 모두 기본 지원
- RLS(Row Level Security)와 Auth가 DB 레벨에서 자연스럽게 연동

**트레이드오프**: Clerk 대비 UI 컴포넌트 기본 제공이 없어 로그인/회원가입 폼을 직접 구현해야 함.

---

## ADR-002: 라우팅 — Next.js App Router + [lang] prefix i18n

**결정**: Next.js App Router의 `[lang]` 동적 세그먼트로 다국어 라우팅을 구현한다. URL 구조: `/{lang}/path`.

**이유**:
- Pages Router 대비 Server Components, Streaming, Layouts 활용 가능
- `[lang]` prefix 방식이 SEO용 `hreflang` 설정에 명확하게 대응됨
- next-intl 라이브러리가 App Router + [lang] 패턴을 공식 지원

**트레이드오프**: `params`가 Promise 형태로 제공되어 `React.use()` 처리가 필수. 미들웨어에서 언어 감지 + 리다이렉트 로직 관리 필요.

---

## ADR-003: 버전 관리 — Semantic Versioning (MAJOR.MINOR.PATCH)

**결정**: 릴리즈는 Semantic Versioning 체계를 따른다.

| 타입 | 기준 | 예시 |
|---|---|---|
| MAJOR | 구조/기능의 비호환 변경 | 로그인 시스템 전면 교체 → 2.0.0 |
| MINOR | 하위 호환 새 기능 추가 | 다크모드 추가 → 1.1.0 |
| PATCH | 버그 수정, 사소한 UI 수정 | 버튼 스타일 수정 → 1.0.1 |

**이유**: 배포 이력 추적과 롤백 판단 기준을 명확히 하기 위함.

---

## ADR-004: 서버/클라이언트 컴포넌트 분리 패턴

**결정**: 브라우저 API나 클라이언트 상태가 필요한 컴포넌트는 서버/클라이언트 파일을 분리하고, 진입점에서 `next/dynamic + ssr: false`로 래핑한다.

```
components/feature/
  ClientFeature.tsx   ← 'use client', 브라우저 로직
  index.tsx           ← dynamic import, ssr: false
```

**이유**: Hydration 에러 방지, 초기 번들 크기 감소, 서버/클라이언트 책임 명확화.

**트레이드오프**: 파일이 두 개로 나뉘어 컴포넌트 수가 증가함. 단, hydration 에러 디버깅 비용보다 낫다.

---

## ADR-005: 배포 환경 — Vercel + Supabase

**결정**: Vercel에 배포하고 Supabase를 DB/Auth/Storage로 사용한다. 도메인: `ibridgemakers.de`.

**이유**:
- Vercel: Next.js 공식 배포 플랫폼, Edge Network, 자동 SSL
- Supabase: PostgreSQL 기반 오픈소스, RLS, Realtime, Storage 통합 제공
- 두 서비스 모두 무료 티어에서 MVP 운영 가능

**트레이드오프**: 두 외부 서비스에 대한 의존도 증가. 서비스 장애 시 양쪽 모두 영향을 받을 수 있음.

---

## ADR-006: 디자인 시스템 — Apple HIG 기반 + ShadCN

**결정**: Apple Human Interface Guidelines를 디자인 기준으로 삼고, ShadCN 컴포넌트를 기반 UI로 사용한다.

**이유**:
- AHIG: 직관성과 일관성 측면에서 검증된 가이드라인
- ShadCN: Radix UI 기반, 접근성 보장, Tailwind와 자연스럽게 통합
- 브랜드 컬러(금색 `#cba967`)를 Tailwind config에 커스텀 등록

**트레이드오프**: ShadCN은 컴포넌트를 직접 소유(copy-paste)하므로 업스트림 업데이트를 수동으로 반영해야 함.
