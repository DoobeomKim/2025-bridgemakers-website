import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { MenuItem } from '@/lib/constants/menus';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 메뉴 데이터 유효성 검사 함수
function validateMenuItem(menu: any): menu is MenuItem {
  return (
    typeof menu === 'object' &&
    typeof menu.id === 'string' &&
    typeof menu.name === 'object' &&
    typeof menu.name.ko === 'string' &&
    typeof menu.name.en === 'string' &&
    typeof menu.path === 'string' &&
    typeof menu.isActive === 'boolean' &&
    typeof menu.orderIndex === 'number'
  );
}

// 인증 체크 함수
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

export async function PUT(request: Request) {
  try {
    // 인증 체크
    const authResult = await checkAuth(request);
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // 요청 본문 파싱
    const menus = await request.json();
    
    // 메뉴 데이터 유효성 검사
    if (!Array.isArray(menus)) {
      return NextResponse.json(
        { error: '잘못된 메뉴 데이터 형식입니다.' },
        { status: 400 }
      );
    }

    // 각 메뉴 항목의 유효성 검사
    for (const menu of menus) {
      if (!validateMenuItem(menu)) {
        return NextResponse.json(
          { error: '잘못된 메뉴 항목 형식입니다.' },
          { status: 400 }
        );
      }
    }

    console.log('🔄 메뉴 데이터 저장 시작:', {
      menusCount: menus.length,
      sampleMenu: menus[0] ? {
        id: menus[0].id,
        name: menus[0].name,
        path: menus[0].path
      } : null
    });

    // 🎯 RLS 우회를 위해 Service Role (Admin) 클라이언트 사용
    const adminSupabase = createAdminClient();

    // 메뉴 데이터를 Supabase에 저장
    const { error: upsertError } = await adminSupabase
      .from('settings')
      .upsert(
        { 
          key: 'header_menus',
          value: menus,  // 🎯 jsonb 컬럼이므로 JSON.stringify 제거
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (upsertError) {
      console.error('❌ Menu upsert error:', upsertError);
      throw upsertError;
    }

    console.log('✅ 메뉴 데이터 저장 성공');

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('메뉴 업데이트 오류:', error);
    return NextResponse.json(
      { error: '메뉴 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 🎯 GET도 일관성을 위해 Admin 클라이언트 사용 (RLS 우회)
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('settings')
      .select('value')
      .eq('key', 'header_menus')
      .single();

    if (error) {
      // 데이터가 없는 경우 빈 배열 반환
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: true, data: [] as MenuItem[] });
      }
      console.error('Menu fetch error:', error);
      throw error;
    }

    // value가 null이거나 undefined인 경우 빈 배열 반환
    if (!data || data.value === null || data.value === undefined) {
      return NextResponse.json({ success: true, data: [] as MenuItem[] });
    }

    let menus: MenuItem[] = [];
    try {
      // 🎯 jsonb 컬럼이지만 문자열로 저장된 경우와 객체로 저장된 경우 모두 처리
      let parsedValue;
      
      if (typeof data.value === 'string') {
        // 문자열인 경우 JSON 파싱
        console.log('📝 문자열 형태의 메뉴 데이터 파싱 중...');
        parsedValue = JSON.parse(data.value);
      } else {
        // 이미 객체인 경우 그대로 사용
        console.log('📦 객체 형태의 메뉴 데이터 사용 중...');
        parsedValue = data.value;
      }
      
      console.log('🔍 파싱된 메뉴 데이터:', {
        type: typeof parsedValue,
        isArray: Array.isArray(parsedValue),
        length: Array.isArray(parsedValue) ? parsedValue.length : 'N/A',
        sample: Array.isArray(parsedValue) && parsedValue.length > 0 ? parsedValue[0] : null
      });
      
      // 파싱된 결과가 배열이 아닌 경우 빈 배열로 초기화
      if (!Array.isArray(parsedValue)) {
        console.warn('⚠️ 파싱된 데이터가 배열이 아님:', typeof parsedValue);
        return NextResponse.json({ success: true, data: [] as MenuItem[] });
      }
      
      // 각 메뉴 항목의 유효성 검사
      menus = parsedValue.filter(menu => {
        const isValid = validateMenuItem(menu);
        if (!isValid) {
          console.warn('⚠️ 유효하지 않은 메뉴 항목:', menu);
        }
        return isValid;
      });
      
      console.log('✅ 유효한 메뉴 개수:', menus.length);
    } catch (parseError) {
      console.error('❌ 메뉴 데이터 파싱 오류:', parseError);
      console.error('원본 데이터:', data.value);
      return NextResponse.json({ success: true, data: [] as MenuItem[] });
    }

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    return NextResponse.json(
      { error: '메뉴 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 