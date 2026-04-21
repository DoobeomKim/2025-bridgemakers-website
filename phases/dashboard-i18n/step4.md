# Step 4: dashboard-ui-i18n

## 읽어야 할 파일

먼저 아래 파일들을 읽고 하드코딩된 텍스트와 타입 구조를 파악하라:

- `docs/DASHBOARD.md` — 각 컴포넌트 구현 현황 및 하드코딩 위치 개요
- `app/[lang]/dashboard/layout.tsx` — 클라이언트 레이아웃, translations 전달 구조
- `app/[lang]/dashboard/components/DashboardSidebar.tsx`
- `app/[lang]/dashboard/components/DashboardHeader.tsx`
- `app/[lang]/dashboard/projects/ProjectsClient.tsx`
- `app/[lang]/dashboard/projects/page.tsx` — translations 전달 방식 확인
- `components/dashboard/projects/ProjectsTable.tsx`
- `components/dashboard/projects/ProjectsTableRow.tsx`
- `messages/ko/dashboard.json` — step 0에서 완성된 번역 키
- `messages/en/dashboard.json`
- `lib/i18n/index.ts` — Locale 타입 (ko | en)

## 작업

대시보드 UI 전반의 하드코딩된 한국어 텍스트를 번역 키로 교체하고, 타입 불일치를 해결하라.

---

### 작업 1: `translations` prop 타입 업데이트

`DashboardHeader`, `DashboardSidebar`, `ProjectsClient`의 translations 타입이 현재 `{ [key: string]: string }` (flat string 전용)으로 선언되어 있다. Step 0에서 `dashboard.json`에 `projectList`, `projectForm` 등 중첩 객체가 추가되었으므로, 이 타입들을 `Record<string, any>`로 완화한다.

수정 대상:
- `DashboardHeader`: `translations: Record<string, any>`
- `DashboardSidebar`: `translations: Record<string, any>`
- `ProjectsClient`: `translations: Record<string, any>`

---

### 작업 2: `ProjectsClient.tsx` — 번역 키 연결 (최초 연결)

`ProjectsClient`는 현재 `translations` prop을 받지만 **실제로 사용하지 않는다**. 하드코딩된 한국어를 번역 키로 교체한다.

번역 키 참조: `translations.projectList.*`

| 하드코딩 문자열 | 번역 키 |
|---|---|
| `"새 프로젝트"` | `translations.projectList.newProject` |
| `placeholder="프로젝트 검색..."` | `translations.projectList.search` |
| `"공개 설정 변경"` | `translations.projectList.visibilityChange` |
| `"공개로 변경"` | `translations.projectList.makePublic` |
| `"비공개로 변경"` | `translations.projectList.makePrivate` |
| `"선택 항목 삭제"` | `translations.projectList.deleteSelected` |
| `` `${n}개 선택됨` `` | `` `${selectedItems.length} ${translations.projectList.selected}` `` |

**권한 없음 / 로딩 메시지 처리:**

```tsx
// 변경 전
if (userLoading) return <div className="text-white p-8">권한 확인중...</div>;
if (userProfile?.user_level !== UserRole.ADMIN) {
  return <div className="text-red-500 ...">접근 권한이 없습니다.</div>;
}
if (loading) return <div className="text-white p-8">로딩중...</div>;

// 변경 후 — projectList 번역 키 사용
if (loading) return <div className="text-white p-8">{translations.projectList?.loading || 'Loading...'}</div>;
if (userProfile?.user_level !== UserRole.ADMIN) {
  return <div className="text-red-500 ...">{translations.projectList?.noPermission || 'No permission.'}</div>;
}
```

**`alert()` 및 `confirm()` 제거:**

- `confirm()`: 인라인 삭제 확인 상태로 교체:
  ```typescript
  const [pendingDelete, setPendingDelete] = useState(false);
  // handleDelete에서 confirm() 대신 setPendingDelete(true)
  // UI에 확인 버튼 추가: "정말 삭제하시겠습니까?" → 확인/취소
  ```
- `alert()`: `useState<string | null>` 에러 상태로 교체. `<p className="text-red-500 text-sm mt-2">` 로 표시.

---

### 작업 3: `DashboardSidebar.tsx` — fallback 문자열 한국어 제거

이미 `translations.xxx || "한국어"` 패턴을 사용 중이다. fallback만 영어로 교체한다:

| 현재 fallback | 변경 후 |
|---|---|
| `"대시보드"` | `"Dashboard"` |
| `"프로필 설정"` | `"Profile"` |
| `"관리자"` | `"Admin"` |
| `"프로젝트"` | `"Projects"` |
| `"계정 관리"` | `"Settings"` |
| `"사이트 관리"` | `"Site Management"` |
| `"로그아웃"` | `"Logout"` |

---

### 작업 4: `DashboardHeader.tsx` — 하드코딩 교체

```tsx
// 변경 전
<h1 className="text-xl font-semibold">{translations.dashboard || "대시보드"}</h1>

// 변경 후
<h1 className="text-xl font-semibold">{translations.dashboard || "Dashboard"}</h1>
```

다른 하드코딩 한국어가 있다면 동일하게 교체한다.

---

### 작업 5: `layout.tsx` — 로딩 화면 한국어 + console.log 정리

`layout.tsx`에 하드코딩된 한국어 문자열과 디버그 `console.log`가 다수 있다:

**로딩 문자열 교체:**
```tsx
// "대시보드 준비 중..." → "Loading..."
// "프로필 로딩 중..." → "Loading..."
// "인증 확인 중..." → "Verifying..."
```

**console.log 제거:**  
`'⏰'`, `'✅'`, `'🏠'`, `'⏳'`, `'🚫'`, `'🎯'` 이모지가 포함된 디버그 console.log를 모두 제거한다. `console.error`는 유지한다.

---

### 작업 6: `ProjectsTable.tsx` / `ProjectsTableRow.tsx` (해당 시)

테이블 헤더나 상태 뱃지에 하드코딩된 한국어가 있다면 교체한다.  
`projectList` 네임스페이스에 없는 키가 필요하면 `messages/ko|en/dashboard.json`에 동시에 추가한다.

---

### 로케일 처리 참고

- `lib/i18n/index.ts`의 `locales = ['en', 'ko']` — `de`는 지원 로케일이 아니며, `/de/` 경로는 미들웨어에서 `/en/`으로 리다이렉트된다. 별도 처리 불필요.
- `layout.tsx`는 `'use client'`에서 `getTranslations(locale, "dashboard")`를 호출한다. 이 패턴은 유지한다.

---

## Acceptance Criteria

```bash
npm run build   # 타입 에러 없음
npm run lint    # 린트 통과
```

추가 확인 (브라우저):
- `/ko/dashboard/projects` → 한국어 UI
- `/en/dashboard/projects` → 영어 UI
- `alert()`가 전혀 사용되지 않는다.
- `confirm()`이 전혀 사용되지 않는다.
- 브라우저 콘솔에 한국어 debug 로그가 없다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. `phases/dashboard-i18n/index.json`의 step 4를 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "대시보드 UI i18n 완료 — translations 타입 수정, ProjectsClient 번역 첫 연결, alert/confirm 제거, layout 로그 정리"`
3. 전체 phase가 완료되었으면 `phases/index.json`의 `dashboard-i18n` status를 `"completed"`로 업데이트한다.

## 금지사항

- `alert()`를 사용하지 마라.
- `confirm()`을 사용하지 마라. 인라인 확인 UI로 대체하라.
- 번역 키 없이 하드코딩된 한국어 문자열을 남기지 마라.
- 서버 컴포넌트에서 `useParams()`를 사용하지 마라. 서버 컴포넌트는 props로 locale을 받는다.
