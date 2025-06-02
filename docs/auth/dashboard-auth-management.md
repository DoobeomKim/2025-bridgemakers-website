# 대시보드 내 작업시 인증 관리

## 1. 개요

대시보드에서의 인증 관리는 다음과 같은 전략으로 구현되어 있습니다:
- API 요청 인터셉터를 통한 중앙 집중식 인증 관리
- 토큰 자동 갱신 및 세션 만료 처리
- 효율적인 세션 상태 체크

## 2. 구현 방식

### 2.1 API 클라이언트 설정

```typescript
// lib/api/supabaseClient.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

const supabaseClient = createClientComponentClient<Database>();

// 인증 상태 변경 감지
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ 토큰 자동 갱신됨');
  } else if (event === 'SIGNED_OUT') {
    console.log('⚠️ 세션 만료');
    // 로그아웃 처리
  }
});

// API 요청 래퍼 함수
export const apiRequest = async (requestFn: () => Promise<any>) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error: any) {
    // 401 Unauthorized 에러 발생 시
    if (error.status === 401 || error.code === 'PGRST301') {
      console.log('🔄 인증 만료 - 세션 체크 필요');
      // AuthContext의 checkSession 호출 또는 로그아웃 처리
    }
    throw error;
  }
};

export default supabaseClient;
```

### 2.2 컴포넌트에서 사용 방법

```typescript
// 데이터 저장 예시
const handleSave = async () => {
  try {
    await apiRequest(async () => {
      const { data, error } = await supabaseClient
        .from('your_table')
        .update({ ... })
        .eq('id', id);
        
      if (error) throw error;
      return data;
    });
  } catch (error) {
    // 에러 처리
  }
};
```

## 3. 세션 체크 시점

다음 상황에서만 세션 체크가 수행됩니다:

1. **브라우저 네비게이션**
   - 뒤로가기/앞으로가기 사용 시
   - URL을 통한 직접 접근 시

2. **네트워크 상태 변경**
   - 온라인 상태로 복귀 시

3. **API 요청 실패**
   - 401 Unauthorized 에러 발생 시
   - 토큰 만료 시

## 4. 장점

1. **효율성**
   - 불필요한 세션 체크 최소화
   - 실제 인증 문제 발생 시에만 대응

2. **중앙 관리**
   - 인증 로직 중복 제거
   - 일관된 에러 처리

3. **사용자 경험**
   - 자동 토큰 갱신으로 끊김 없는 사용
   - 세션 만료 시 적절한 처리

## 5. 주의사항

1. **에러 처리**
   - 모든 API 요청은 `apiRequest` 래퍼 함수 사용
   - 적절한 에러 메시지 표시

2. **상태 관리**
   - 세션 만료 시 사용자 데이터 초기화
   - 로컬 스토리지 캐시 정리

3. **보안**
   - 민감한 작업 전 추가 인증 고려
   - 주기적인 토큰 갱신 확인 