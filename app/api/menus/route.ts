import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    // 세션 체크
    const supabase = await createClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
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

    // 메뉴 데이터를 JSON 파일로 저장
    const menuFilePath = path.join(process.cwd(), 'data', 'menus.json');
    await fs.writeFile(menuFilePath, JSON.stringify(menus, null, 2));

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
    // 메뉴 파일 읽기
    const menuFilePath = path.join(process.cwd(), 'data', 'menus.json');
    const menuData = await fs.readFile(menuFilePath, 'utf-8');
    const menus = JSON.parse(menuData);

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    
    // 파일이 없는 경우 빈 배열 반환
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ success: true, data: [] });
    }
    
    return NextResponse.json(
      { error: '메뉴 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 