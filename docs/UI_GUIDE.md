# UI_GUIDE — Bridgemakers 디자인 시스템

> 모든 디자인 작업은 **Apple Human Interface Guidelines**를 기본 참고자료로 활용한다.
> 이 문서는 `tailwind.config.ts`, `app/globals.css`, 실제 페이지 컴포넌트를 기준으로 작성되었다.

## 디자인 철학

1. 도구처럼 보여야 한다. 마케팅 페이지가 아니라 매일 쓰는 대시보드
2. 불필요한 장식을 제거하고 콘텐츠가 중심이 되게 한다
3. 직관적이고 일관된 사용자 경험을 제공한다

## 금지사항 (절대 하지 말 것)

- Glass morphism 블러 효과
- 그라데이션 텍스트
- "Powered by AI" 배지
- 네온 글로우 애니메이션
- 보라/인디고 색상 남용
- 과도한 둥근 모서리 일관성
- 배경 오브 장식

---

## 색상 팔레트

### 브랜드 색상 (tailwind.config.ts에 등록)

| 토큰 | 값 | 용도 |
|---|---|---|
| `gold` | `#cba967` | 강조, CTA, 활성 상태, 스크롤바 |
| `gold-dark` | `#b99a58` | gold hover 상태 |
| `bm-dark` | `#2D2D2D` | 다크 배경 대안 |
| `bm-accent` | `#cba967` | gold와 동의어 alias |
| `blue` | `#007AFF` | 링크, 인터랙션 요소 |
| `green` | `#34C759` | 성공 상태 |
| `purple` | `#AF52DE` | 특별 기능 강조 |

### 그레이 시스템

| 토큰 | 값 | 용도 |
|---|---|---|
| `gray-light` | `#F2F2F7` | 배경, 경계선 |
| `gray-medium` | `#C7C7CC` | 보조 텍스트, 비활성 버튼 |
| `gray-dark` | `#8E8E93` | 서브 텍스트 |

### 페이지별 실사용 배경색

| 컨텍스트 | 값 | 사용 위치 |
|---|---|---|
| 메인 배경 | `#000000` / `bg-black` | 공개 페이지 전체 |
| 카드 배경 (work) | `#050a16` | 프로젝트 카드 |
| 드롭다운 배경 | `#1a1a1a` | 필터 드롭다운 |
| 대시보드 카드 | `#1A2234` | 관리자 대시보드 카드 |
| 대시보드 구분선 | `#232b3d` | 대시보드 테이블 보더 |
| 태블릿 프레임 | `#101429` | 홈 히어로 태블릿 |
| 태블릿 보더 | `#1c2142`, `#2e365f` | 홈 히어로 |

### ShadCN CSS 변수 (globals.css)

ShadCN 컴포넌트에서 사용하는 oklch 기반 CSS 변수 시스템이 별도로 존재한다.
대시보드 UI 컴포넌트(버튼, 카드, 인풋 등)는 `var(--background)`, `var(--primary)` 등을 사용한다.
공개 페이지에서는 직접 hex 값을 사용하고, ShadCN 변수를 사용하지 않는다.

### 활성 상태 배경 패턴

필터, 탭 등 선택된 상태:
```
bg-[rgba(203,169,103,0.1)] text-[#cba967]   /* 활성 */
bg-[rgba(255,255,255,0.05)] text-[#C7C7CC]  /* 비활성 */
bg-[rgba(255,255,255,0.1)]                  /* hover */
```

---

## 타이포그래피

### 폰트 패밀리

**body 태그 기본 (globals.css):**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', 'Apple SD Gothic Neo', 'Inter', sans-serif;
```

**Tailwind 등록 alias (tailwind.config.ts):**
```js
fontFamily: {
  'sf-pro':      ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
  'sf-pro-text': ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
  'roboto':      ['var(--font-roboto)', 'sans-serif'],
}
```

> `SF Pro Display` 폰트 파일은 `@font-face`로 `/public/fonts/SFProDisplay-Regular.woff2`에서 로드된다.

### 폰트 크기 (Tailwind 등록)

| 토큰 | 값 | 용도 |
|---|---|---|
| `text-h1` | 32px | 섹션 타이틀 (일반) |
| `text-h2` | 28px | 서브 타이틀 |
| `text-h3` | 24px | 카드 제목 |
| `text-body` | 16px | 본문 |
| `text-body-sm` | 14px | 보조 본문, 버튼 |
| `text-caption` | 12px | 캡션 |

> **주의**: 페이지 히어로 헤딩은 Tailwind 토큰을 쓰지 않고 임의 크기를 사용한다.
> 예: Work 페이지 H1 → `text-[60px] md:text-[80px]` (tracking-[.15em], uppercase)

### 라인 높이 & 자간 (설계 기준)

| 레벨 | Line Height | Letter Spacing |
|---|---|---|
| H1, H2 | 1.2 | 0.5px |
| H3 | 1.3 | 0.5px |
| Body | 1.5 | 0px |
| Caption | 1.4 | 0.25px |

---

## 버튼

### CSS 클래스 (globals.css에 정의됨)

**Primary Button** (`.button-primary`):
```css
background: #cba967;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
transition: transform 0.2s, background-color 0.2s;

:hover { transform: scale(1.05); background: #b99a58; }
```

**Secondary Button** (`.button-secondary`):
```css
/* gradient border 구현 (::after pseudo-element 사용) */
background: transparent;
color: #cba967;
border-radius: 8px;
padding: 12px 24px;

::after {
  background: linear-gradient(to right, #cba967, #b99a58);
  /* mask로 border처럼 보이게 처리 */
}
:hover { background: #cba967; color: #FFFFFF; /* ::after opacity:0 */ }
```

**Text Button** (`.button-text`):
```css
background: transparent;
color: #cba967;
padding: 8px 16px;
:hover { color: #b99a58; }
```

### 필터/탭 버튼 패턴 (인라인 Tailwind)

공개 페이지의 필터, 탭은 `rounded-full` 형태를 사용한다:
```
px-6 py-2 rounded-full text-sm transition
비활성: bg-[rgba(255,255,255,0.05)] text-[#C7C7CC]
활성:   bg-[rgba(203,169,103,0.1)] text-[#cba967]
hover:  bg-[rgba(255,255,255,0.1)]
```

---

## 레이아웃

### 컨테이너

| 페이지 | 설정 | 비고 |
|---|---|---|
| Work 페이지 | `max-w-full`, `px-2 sm:px-4 lg:px-6` | 전체 너비 활용 |
| 대시보드 | 사이드바 레이아웃 별도 | |
| 일반 섹션 설계 기준 | max 1440px, 상하 80px | 설계 의도 |

### 그리드

- 기본 그리드: 12칸
- 프로젝트 카드: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, gap `gap-3 sm:gap-4`
- 간격(Gap): 24px 데스크톱 / 16px 모바일

### 반응형 브레이크포인트

| 이름 | 최소 너비 |
|---|---|
| mobile | 375px |
| tablet (`sm`) | 640px (Tailwind 기본) |
| desktop (`md`) | 768px |
| wide (`lg`) | 1024px |

---

## 둥근 모서리

| 요소 | 값 |
|---|---|
| 버튼, 입력 필드 (설계 기준) | `border-radius: 8px` / `rounded-standard` |
| 프로젝트 카드, 드롭다운 | `rounded-xl` (12px) |
| 필터 버튼 | `rounded-full` |
| ShadCN 컴포넌트 기본 | `--radius: 0.625rem` (10px) |
| 아이콘 컨테이너 | `rounded-full` |
| 태블릿 프레임 | `rounded-[24px]` |

---

## 그림자

| 토큰 | 값 |
|---|---|
| `shadow-sm` | `0 2px 4px rgba(0,0,0,0.1)` |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 6px 16px rgba(0,0,0,0.1)` |
| `shadow-apple` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` |
| `shadow-apple-md` | `0 6px 16px -1px rgba(0,0,0,0.1), 0 2px 8px -1px rgba(0,0,0,0.06)` |

---

## 커스텀 스크롤바 (globals.css)

```css
::-webkit-scrollbar        { width: 8px; }
::-webkit-scrollbar-track  { background: #1A2234; }
::-webkit-scrollbar-thumb  { background: #cba967; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #b99a58; }
```

---

## 애니메이션

### 금색 구름 효과 (홈 히어로 핵심 요소)

클래스: `.golden-cloud-1~4`, `.golden-orb`, `.center-glow`, `.light-beam-horizontal`, `.light-beam-vertical`

`rgba(203, 169, 103, ...)` 기반 radial-gradient + blur 조합으로 구현.
새 히어로 섹션 제작 시 이 패턴을 참고할 것.

### 기타 애니메이션 클래스

| 클래스 | 용도 |
|---|---|
| `.modal-overlay` / `.modal-content` | 모달 fadeIn/scaleIn |
| `.play-btn-pulse` / `.enhanced-pulse` | 비디오 플레이 버튼 pulse |
| `.feature-card` | 카드 hover translateY(-4px) |
| `.tablet-frame` | 홈 히어로 태블릿 목업 프레임 |
| `animate-fadeIn` | Tailwind keyframe (translateY -10px → 0) |

---

## 카드 패턴

### 프로젝트 카드 (Work 페이지)
```
rounded-xl
border border-[rgba(255,255,255,0.1)]
bg-[#050a16]
overflow-hidden
이미지: aspect-[16/9], group-hover:scale-110 transition-transform duration-500
텍스트: p-4, title hover:text-[#cba967]
하단 메타: border-t border-[rgba(255,255,255,0.1)] pt-3
```

### 피처 카드 (홈)
```css
.feature-card {
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
}
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(203,169,103,0.15); }
```

---

## 페이지네이션 패턴

```
비활성: text-[#C7C7CC] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]
활성:   text-black bg-[#cba967] hover:bg-[#d9b979]
disabled: text-gray-medium bg-[rgba(255,255,255,0.05)]
```
