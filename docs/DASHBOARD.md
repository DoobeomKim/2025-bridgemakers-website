# DASHBOARD — 구조 및 구현 현황

## 개요

관리자 및 사용자가 콘텐츠와 사이트 설정을 관리하는 인증 전용 영역.  
URL 패턴: `/{lang}/dashboard/**`  
접근 보호: 미들웨어(서버) + layout.tsx(클라이언트) 이중 가드

---

## 라우트 구조

```
/dashboard                          → 홈 (역할별 분기)
/dashboard/admin                    → 관리자 대시보드
/dashboard/projects                 → 프로젝트 목록
/dashboard/projects/[id]            → 프로젝트 수정
/dashboard/site-management          → 사이트 관리
/dashboard/settings                 ❌ 파일 없음 (사이드바에 메뉴만 존재)
```

---

## 역할별 메뉴 구조 (DashboardSidebar.tsx 기준)

| 메뉴 항목 | 경로 | BASIC | PREMIUM | ADMIN | 구현 상태 |
|---|---|:---:|:---:|:---:|---|
| 대시보드 (홈) | `/dashboard` | ✅ | ✅ | ✅ | 부분 구현 (통계 하드코딩) |
| 프로필 설정 | 헤더 드롭다운 | ✅ | ✅ | ✅ | 구현됨 (ProfileModal) |
| 프로젝트 | `/dashboard/projects` | — | ✅ | ✅ | 구현됨 (ADMIN only 실제 동작) |
| 관리자 | `/dashboard/admin` | — | — | ✅ | 부분 구현 (통계 하드코딩) |
| 계정 관리 | `/dashboard/settings` | — | — | ✅ | ❌ 페이지 파일 없음 |
| 사이트 관리 | `/dashboard/site-management` | — | — | ✅ | 부분 구현 (탭 중 일부만 완성) |

---

## 각 페이지 구현 현황

### `/dashboard` — 대시보드 홈

- **파일**: `page.tsx` (서버) → `DashboardClient.tsx` (클라이언트)
- **구현**: UI 골격 존재, 통계 카드 3개 (프로젝트, 알림, 메시지)
- **미완성**: 세 카드 모두 `0` 하드코딩. DB 연동 없음. "최근 활동" 섹션 비어있음.

### `/dashboard/admin` — 관리자 대시보드

- **파일**: `admin/page.tsx` (서버) → `AdminDashboardClient.tsx` (클라이언트)
- **구현**: 통계 카드 3개 (총 프로젝트 120, 이번 달 방문자 15, 총 조회수 350)
- **미완성**: 모든 수치 하드코딩. DB 연동 없음.

### `/dashboard/projects` — 프로젝트 관리

- **파일**: `projects/page.tsx` → `ProjectsClient.tsx`
- **구현**: 실제 Supabase 연동. 검색, 선택, 생성(모달), 삭제, 공개/비공개 전환 모두 동작.
- **슬러그 생성**: 제목 입력 → 포커스 아웃 시 DeepL로 영어 번역 후 `{year}-{en-title}-{6자리랜덤}` 형식으로 자동 생성. 직접 수정 및 재생성 가능.
- **제한**: ADMIN 역할만 실제 데이터 로드. PREMIUM은 로딩 상태로 고정됨(조건 분기만 있고 PREMIUM 데이터 로드 로직 없음).
- **2026-04-22 개선 (ProjectForm)**:
  - 탭 전환 후 복귀 시 폼 데이터 초기화 버그 수정 (AuthContext SIGNED_IN 이벤트 중복 처리 방지)
  - Tags 입력창에서 쉼표(`,`) 입력 시 즉시 태그 등록 (기존 태그 선택 or 신규 생성)
  - Client 필드를 `SuggestCombobox`로 교체 → 기존 등록된 고객사 자동완성 지원
- **2026-04-22 개선 (ProjectsTableRow)**:
  - 썸네일 이미지 hover 시 Work 공개 페이지 링크 오버레이 표시
  - `/{locale}/work/project/{slug}` 새 탭으로 이동, `ArrowTopRightOnSquareIcon` 아이콘 사용
  - 미사용 `useEffect` import 제거
- **2026-04-22 개선 (ProjectForm AI 버튼)**:
  - AI 내용 정리 버튼 라벨에서 중복 `✨` 이모지 제거 (`SparklesIcon`으로 이미 표시됨)

### `/dashboard/projects/[id]` — 프로젝트 수정

- **파일**: `projects/[id]/page.tsx` → `ProjectEditWrapper` → `ProjectEditModal` (페이지 컴포넌트로 동작)
- **구현**: 전체 페이지로 렌더링 (모달 오버레이 제거). 기본 정보, 다국어 번역(DeepL), 미디어 URL 수정 가능.
- **슬러그**: 제목 기반 자동 생성, 직접 수정 가능. 저장 시 DB 반영.
- **갤러리 이미지 관리**: 미구현 (플레이스홀더)

### `/dashboard/site-management` — 사이트 관리

- **파일**: `site-management/page.tsx` (클라이언트, 자체 완결)
- **탭 구조**:

  | 탭 ID | 탭 이름 | 구현 상태 |
  |---|---|---|
  | `general` | 일반 | 부분 구현 (조직 이름/슬러그 입력 필드 있으나 저장 버튼 없음, 익명 데이터 토글 저장 안됨) |
  | `design` | 디자인 | 구현됨 (헤더 메뉴 CRUD + 순서 변경, 언어 변경 컴포넌트 토글 — API 연동 완성) |
  | `oauth` | OAuth 앱 | ❌ 플레이스홀더 텍스트만 |
  | `audit` | 감사 로그 | ❌ 플레이스홀더 텍스트만 |
  | `legal` | 법적 문서 | ❌ 플레이스홀더 텍스트만 |

- **ADMIN 전용**: 비관리자는 `/dashboard`로 리다이렉트

### `/dashboard/settings` — 계정 관리 ❌

- **파일**: 존재하지 않음
- **사이드바**: ADMIN 메뉴에 링크가 존재 (`/dashboard/settings`)
- **현상**: 클릭 시 Next.js 404 페이지로 이동

---

## 공통 컴포넌트

### DashboardLayout (`layout.tsx`)

- `"use client"` — 클라이언트 컴포넌트
- `AuthContext`에서 `session`, `userProfile`, `isLoading` 확인
- 인증 없으면 1초 setTimeout 후 `/{lang}`으로 리다이렉트
- **2026-04-22 개선**: `wasEverAuthenticatedRef` 추가 → 토큰 갱신(TOKEN_REFRESHED) 시 auth 상태가 순간 flicker해도 `children`을 언마운트하지 않음. 탭 전환 후 복귀 시 폼 입력 데이터 유지됨.

### DashboardSidebar (`components/DashboardSidebar.tsx`)

- 역할(`UserRole.ADMIN`, `PREMIUM`, `BASIC`)별 메뉴 필터링
- 현재 경로 활성 상태 강조

### DashboardHeader (`components/DashboardHeader.tsx`)

- 언어 스위처, 프로필 드롭다운 포함
- 프로필 수정은 `ProfileModal`을 통해 인라인 처리 (별도 페이지 없음)

---

## 인증 보호 계층

```
요청
  ↓
middleware.ts          ← 서버사이드: session 없으면 /{lang} 리다이렉트
  ↓
dashboard/layout.tsx   ← 클라이언트: AuthContext 확인, 1초 후 리다이렉트
                          wasEverAuthenticatedRef로 토큰 갱신 flicker 방어
  ↓
각 page.tsx / Client   ← 역할 검사 (ADMIN 전용 페이지는 컴포넌트 내에서 추가 확인)
```

### AuthContext (`components/auth/AuthContext.tsx`)

- `onAuthStateChange`에서 SIGNED_IN 처리 시 `lastProcessedUserIdRef` + `userProfileRef`로 동일 사용자 토큰 갱신 이벤트를 감지
- 동일 사용자의 반복 SIGNED_IN(TOKEN_REFRESHED 연쇄)은 `loadUserProfile` 재호출 없이 세션/유저 객체만 조용히 업데이트 → 불필요한 리렌더 최소화 **(2026-04-22 추가)**

---

## 미구현 항목 요약 (우선순위 순)

| 항목 | 심각도 | 설명 |
|---|---|---|
| `/dashboard/settings` 페이지 없음 | 높음 | 메뉴 링크 있지만 404. ADMIN용 계정 관리 기능 부재 |
| 대시보드 홈 통계 하드코딩 | 중간 | 프로젝트 수, 알림, 메시지 모두 `0`으로 고정 |
| 관리자 통계 하드코딩 | 중간 | 방문자, 조회수 등 DB 미연동 |
| PREMIUM 프로젝트 접근 | 중간 | 사이드바에 메뉴 있으나 실제 데이터 로드 안됨 |
| 사이트 관리 일반 탭 저장 | 낮음 | 조직 이름/슬러그 저장 버튼 없음 |
| OAuth/감사로그/법적문서 탭 | 낮음 | 플레이스홀더만 존재 |
| layout.tsx 1초 지연 | 낮음 | 클라이언트 auth 체크 지연 제거 가능 |
