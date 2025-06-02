import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// 🎯 AuthContext와 동일한 클라이언트 인스턴스 사용
let supabaseClientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

const getSupabaseClient = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClientComponentClient<Database>();
  }
  return supabaseClientInstance;
};

const supabaseClient = getSupabaseClient();

// 인증 상태 변경 감지
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ API Client: 토큰 자동 갱신됨');
  } else if (event === 'SIGNED_OUT') {
    console.log('⚠️ API Client: 세션 만료');
  }
});

// 세션 새로고침 함수
const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    
    console.log('🔍 API Client 세션 상태:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userId: session?.user?.id
    });
    
    return session;
  } catch (error) {
    console.error('❌ API Client 세션 새로고침 실패:', error);
    return null;
  }
};

// API 요청 래퍼 함수
export const apiRequest = async (url: string, options: RequestInit = {}, authOptions: { requireAuth?: boolean } = { requireAuth: true }) => {
  try {
    // 세션 확인
    const session = await refreshSession();
    
    // 인증이 필요한 요청인 경우
    if (authOptions.requireAuth && !session?.access_token) {
      console.error('🚨 API 요청 실패: 세션 없음', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        requireAuth: authOptions.requireAuth
      });
      throw new Error('로그인이 필요합니다.');
    }

    // 요청 헤더 설정
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 세션이 있는 경우 Authorization 헤더 추가
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      console.log('✅ API 요청: Authorization 헤더 추가됨', {
        url,
        method: options.method || 'GET'
      });
    }

    // 실제 요청 수행
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 401 에러 처리 (토큰 만료)
    if (response.status === 401) {
      console.log('🔄 401 에러 - 토큰 갱신 시도');
      
      // 토큰 만료 시 세션 갱신 시도
      const newSession = await refreshSession();
      if (!newSession?.access_token) {
        console.log('❌ 세션 갱신 실패 - 로그아웃 처리');
        await supabaseClient.auth.signOut();
        window.location.href = '/';
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      // 갱신된 토큰으로 요청 재시도
      const newHeaders: Record<string, string> = {
        ...headers,
        'Authorization': `Bearer ${newSession.access_token}`,
      };
      
      console.log('🔄 갱신된 토큰으로 재시도');
      return await fetch(url, {
        ...options,
        headers: newHeaders,
      });
    }
    
    // 응답 상태 코드 확인
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `요청 실패: ${response.status}`);
    }

    return response;
  } catch (error: any) {
    console.error('🚨 API 요청 실패:', error);
    throw error;
  }
};

export default supabaseClient; 