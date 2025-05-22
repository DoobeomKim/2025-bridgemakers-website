import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createServerClient } from '@/lib/supabase/server';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'settings.json');

// 설정 파일 읽기
async function readSettings() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings file:', error);
    return { language_switcher_enabled: true };
  }
}

// 설정 파일 쓰기
async function writeSettings(settings: any) {
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error writing settings file:', error);
    throw error;
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 언어 변경 컴포넌트 상태 조회
export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json({
      enabled: settings.language_switcher_enabled
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
    // 세션 체크
    const supabase = createServerClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    
    if (sessionError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { enabled } = await request.json();
    const settings = await readSettings();
    
    // 설정 업데이트
    settings.language_switcher_enabled = enabled;
    await writeSettings(settings);

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