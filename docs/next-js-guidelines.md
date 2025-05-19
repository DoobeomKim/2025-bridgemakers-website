# Next.js 개발 가이드라인

## 동적 라우트 파라미터(params) 처리 규칙

Next.js 13.4+ 버전에서는 동적 라우트 파라미터가 Promise 형태로 제공됩니다. 이에 따라 다음 규칙을 준수해야 합니다:

### 1. 서버 컴포넌트에서 React.use() 사용하기

서버 컴포넌트(기본 컴포넌트)에서는 `React.use()`를 사용하여 params를 처리합니다:

```tsx
// ❌ 잘못된 방식 (경고 발생)
export default function MyComponent({ params }: { params: { slug: string } }) {
  const { slug } = params; // 직접 접근하면 경고 발생
  // ...
}

// ✅ 올바른 방식
import { use } from "react";

export default function MyComponent({ params }: { params: { slug: string } }) {
  const resolvedParams = use(Promise.resolve(params));
  const slug = resolvedParams.slug;
  // ...
}
```

### 2. 클라이언트 컴포넌트에서 params 처리 (권장 패턴: 컴포넌트 분리)

"use client" 지시어가 있는 컴포넌트에서는 params를 직접 사용하는 방식보다 **서버 컴포넌트와 클라이언트 컴포넌트를 분리**하는 것이 권장됩니다:

```tsx
// page.tsx (서버 컴포넌트)
import { use } from "react";
import ClientComponent from "./ClientComponent";

export default function Page({ params }: { params: { lang: string } }) {
  // 서버에서 params 처리
  const resolvedParams = use(Promise.resolve(params));
  const lang = resolvedParams.lang;
  
  // 처리된 값을 클라이언트 컴포넌트로 전달
  return <ClientComponent lang={lang} />;
}

// ClientComponent.tsx
"use client";
import { useState } from "react";

export default function ClientComponent({ lang }: { lang: string }) {
  // 이제 params 대신 props로 받은 값을 사용
  const [state, setState] = useState(null);
  // ...
}
```

이 패턴은 다음과 같은 이점이 있습니다:

1. 서버 컴포넌트에서 params를 처리하므로 경고가 발생하지 않습니다.
2. 클라이언트 컴포넌트는 이미 처리된 값을 props로 받아 사용합니다.
3. 서버/클라이언트 관심사 분리가 명확해집니다.

### 3. 레이아웃과 페이지 서버 컴포넌트에서 적용

레이아웃과 페이지(서버 컴포넌트)에서는 `React.use()`를 사용합니다:

```tsx
// app/[lang]/layout.tsx
import { use } from "react";

export default function Layout({ children, params }: { children: React.ReactNode, params: { lang: string } }) {
  const resolvedParams = use(Promise.resolve(params));
  const lang = resolvedParams.lang;
  // ...
}

// app/[lang]/[slug]/page.tsx (서버 컴포넌트인 경우)
import { use } from "react";

export default function Page({ params }: { params: { lang: string, slug: string } }) {
  const resolvedParams = use(Promise.resolve(params));
  const { lang, slug } = resolvedParams;
  // ...
}
```

### 4. 주의사항

- 서버 컴포넌트에서는 `use(Promise.resolve(params))`를 사용합니다.
- 클라이언트 컴포넌트에서는 가능한 서버 컴포넌트를 거쳐 필요한 값만 props로 전달받아 사용합니다.
- 불가피하게 클라이언트 컴포넌트에서 직접 params를 사용해야 한다면, 현재 버전에서는 경고만 표시되지만 향후 버전에서는 오류가 발생할 수 있습니다.
- `use`는 항상 컴포넌트의 최상위 레벨에서 호출해야 합니다 (조건문이나 반복문 내부에서 호출 금지).
- React 18 이상에서만 사용 가능합니다.

이 가이드라인은 Next.js의 향후 버전에서 발생할 수 있는 오류를 방지하기 위한 것입니다. 현재는 경고만 발생하지만, 미래 버전에서는 필수 요구사항이 될 예정입니다.

## 참고 자료

- [Next.js 공식 문서: 라우트 핸들러](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React 공식 문서: use](https://react.dev/reference/react/use) 