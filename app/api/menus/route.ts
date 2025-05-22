import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { MenuItem } from '@/lib/constants/menus';

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

export async function PUT(request: Request) {
  try {
    // 세션 체크
    const supabase = createServerClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자 권한 체크
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('user_level')
      .eq('id', user.id)
      .single();

    if (userError || !userProfile || userProfile.user_level !== 'admin') {
      console.error('User authorization error:', { userError, userProfile });
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
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

    // 메뉴 데이터를 Supabase에 저장
    const { error: upsertError } = await supabase
      .from('settings')
      .upsert(
        { 
          key: 'header_menus',
          value: JSON.stringify(menus),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (upsertError) {
      console.error('Menu update error:', upsertError);
      throw upsertError;
    }

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
    const supabase = createServerClient();
    const { data, error } = await supabase
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
      // value가 이미 배열인 경우 그대로 사용, 문자열인 경우 파싱
      const parsedValue = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      
      // 파싱된 결과가 배열이 아닌 경우 빈 배열로 초기화
      if (!Array.isArray(parsedValue)) {
        return NextResponse.json({ success: true, data: [] as MenuItem[] });
      }
      
      // 각 메뉴 항목의 유효성 검사
      menus = parsedValue.filter(menu => validateMenuItem(menu));
    } catch (parseError) {
      console.error('메뉴 데이터 파싱 오류:', parseError);
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