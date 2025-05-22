# Next.js 클라이언트 사이드 컴포넌트 패턴 가이드

## 개요

Next.js에서 서버 사이드 렌더링(SSR)과 클라이언트 사이드 렌더링(CSR)을 효과적으로 분리하는 패턴을 설명합니다.

## 문제 상황

다음과 같은 상황에서 hydration 에러가 발생할 수 있습니다:

1. 브라우저 API 사용 (`window`, `document`, `localStorage` 등)
2. 클라이언트 상태 관리
3. 인증/세션 관리
4. 브라우저 이벤트 처리

## 해결 패턴

### 1. 파일 구조

```
components/
  feature/
    ClientComponent.tsx     # 클라이언트 로직
    index.tsx              # 서버/클라이언트 연결
```

### 2. 클라이언트 컴포넌트 (ClientComponent.tsx)

```typescript
'use client';

const ClientComponent = () => {
  // 클라이언트 사이드 로직
  // - 브라우저 API 사용
  // - 상태 관리
  // - 이벤트 핸들링
};

export default ClientComponent;
```

### 3. 서버/클라이언트 연결 (index.tsx)

```typescript
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(
  () => import('./ClientComponent'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default ClientComponent;
```

## 사용 예시

### 1. 인증 컴포넌트

```typescript
// components/auth/ClientAuthProvider.tsx
'use client';

const ClientAuthProvider = () => {
  // 인증 로직
};

// components/auth/AuthProvider.tsx
import dynamic from 'next/dynamic';

const AuthProvider = dynamic(
  () => import('./ClientAuthProvider'),
  { ssr: false }
);
```

### 2. 로컬스토리지 사용

```typescript
// components/storage/ClientStorageComponent.tsx
'use client';

const ClientStorageComponent = () => {
  // localStorage 사용
};

// components/storage/index.tsx
import dynamic from 'next/dynamic';

const StorageComponent = dynamic(
  () => import('./ClientStorageComponent'),
  { ssr: false }
);
```

### 3. 브라우저 API 사용

```typescript
// components/browser/ClientBrowserComponent.tsx
'use client';

const ClientBrowserComponent = () => {
  // window, document 등 사용
};

// components/browser/index.tsx
import dynamic from 'next/dynamic';

const BrowserComponent = dynamic(
  () => import('./ClientBrowserComponent'),
  { ssr: false }
);
```

## 장점

1. **Hydration 에러 방지**
   - 서버와 클라이언트의 렌더링 결과가 일치
   - 예측 가능한 렌더링 동작

2. **코드 분할**
   - 필요한 시점에 코드 로드
   - 초기 번들 크기 감소

3. **명확한 책임 분리**
   - 서버/클라이언트 로직 구분
   - 유지보수성 향상

## 주의사항

1. **성능 고려**
   - 동적 임포트로 인한 추가 네트워크 요청
   - 적절한 로딩 상태 표시 필요

2. **코드 중복 방지**
   - 공통 로직은 별도 모듈로 분리
   - 타입과 인터페이스 재사용

3. **상태 관리**
   - 전역 상태는 최상위 클라이언트 컴포넌트에서 관리
   - 상태 변화 시 하위 컴포넌트 리렌더링 고려 