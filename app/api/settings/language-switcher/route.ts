import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 언어 변경 컴포넌트 상태 조회
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'language_switcher_enabled')
      .single();

    if (error) {
      // 데이터가 없는 경우 기본값 반환
      if (error.code === 'PGRST116') {
        return NextResponse.json({ enabled: true });
      }
      throw error;
    }

    return NextResponse.json({
      enabled: data.value === true
    });
  } catch (error) {
    console.error('Error fetching language switcher state:', error);
    return NextResponse.json({
      enabled: true // 기본값으로 활성화 상태 반환
    });
  }
}

// 언어 변경 컴포넌트 상태 업데이트
export async function PUT(request: Request) {
  try {
    const supabase = createServerClient();
    
    // 세션 체크
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자 정보 조회
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('user_level')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile || userProfile.user_level !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { enabled } = await request.json();

    // 설정 업데이트
    const { error } = await supabase
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
      console.error('Settings update error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      enabled
    });
  } catch (error) {
    console.error('Error updating language switcher state:', error);
    return NextResponse.json(
      { error: '언어 변경 컴포넌트 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 