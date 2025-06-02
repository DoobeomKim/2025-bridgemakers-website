import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 인증 체크 함수 (헤더 메뉴 API와 동일)
async function checkAuth(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient();

  // Authorization 헤더에서 토큰 추출
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return { error: '인증 토큰이 없습니다.', status: 401 };
  }

  try {
    // 토큰으로 세션 검증
    const { data: { user }, error: sessionError } = await supabase.auth.getUser(token);
    
    if (sessionError || !user) {
      return { error: '로그인이 필요합니다.', status: 401 };
    }

    // 사용자 권한 체크
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('user_level')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile || userProfile.user_level !== 'admin') {
      return { error: '관리자 권한이 필요합니다.', status: 403 };
    }

    return { user, userProfile };
  } catch (error) {
    console.error('인증 체크 오류:', error);
    return { error: '인증 처리 중 오류가 발생했습니다.', status: 500 };
  }
}

// 언어 변경 컴포넌트 상태 조회
export async function GET() {
  try {
    // 🎯 Service Role 사용으로 통일
    const adminSupabase = createAdminClient();
    
    console.log('🔍 언어 변경 컴포넌트 설정 조회 중...');
    
    const { data, error } = await adminSupabase
      .from('settings')
      .select('value')
      .eq('key', 'language_switcher_enabled')
      .single();

    if (error) {
      // 데이터가 없는 경우 기본값 반환
      if (error.code === 'PGRST116') {
        console.log('📝 기본값 사용: 언어 변경 컴포넌트 활성화');
        return NextResponse.json({ enabled: true });
      }
      console.error('❌ 언어 설정 조회 에러:', error);
      throw error;
    }

    const enabled = data.value === true;
    console.log('✅ 언어 변경 컴포넌트 설정 조회 성공:', { enabled });

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('❌ 언어 변경 컴포넌트 상태 조회 실패:', error);
    return NextResponse.json({
      enabled: true // 기본값으로 활성화 상태 반환
    });
  }
}

// 언어 변경 컴포넌트 상태 업데이트
export async function PUT(request: Request) {
  try {
    console.log('🚀 언어 변경 컴포넌트 설정 업데이트 시작...');
    
    // 🎯 헤더 메뉴와 동일한 인증 체크
    const authResult = await checkAuth(request);
    if ('error' in authResult) {
      console.error('❌ 인증 실패:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { enabled } = await request.json();
    console.log('📝 설정 값:', { enabled, type: typeof enabled });

    // 🎯 Service Role 사용으로 RLS 우회 (헤더 메뉴와 동일)
    const adminSupabase = createAdminClient();

    // 설정 업데이트
    const { error } = await adminSupabase
      .from('settings')
      .upsert(
        { 
          key: 'language_switcher_enabled',
          value: enabled === true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('❌ 언어 설정 업데이트 에러:', error);
      throw error;
    }

    console.log('✅ 언어 변경 컴포넌트 설정 업데이트 성공');

    return NextResponse.json({
      success: true,
      enabled
    });
  } catch (error) {
    console.error('❌ 언어 변경 컴포넌트 상태 업데이트 실패:', error);
    return NextResponse.json(
      { error: '언어 변경 컴포넌트 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 