import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서비스 롤 키를 사용하는 Supabase 클라이언트 생성 (서버 사이드에서만 실행)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    console.log('이미지 업로드 API 호출됨');
    // 요청 본문 파싱
    const { fileName, fileType, fileData } = await request.json();

    if (!fileName || !fileType || !fileData) {
      console.error('업로드 파라미터 누락:', { fileName: !!fileName, fileType: !!fileType, fileData: !!fileData });
      return NextResponse.json(
        { error: { message: '필수 파라미터가 누락되었습니다.' } },
        { status: 400 }
      );
    }

    console.log('파일 업로드 시작:', fileName, fileType);
    
    // Base64 데이터를 Blob으로 변환
    const base64Data = fileData;
    const buffer = Buffer.from(base64Data, 'base64');

    // Supabase 스토리지에 업로드 (서비스 롤 키 사용, RLS 우회)
    const { error } = await supabaseAdmin.storage
      .from('projects')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: true, // 기존 파일 덮어쓰기 허용
        contentType: fileType,
      });

    if (error) {
      console.error('Supabase 스토리지 업로드 에러:', error);
      return NextResponse.json(
        { error: { message: `이미지 업로드 실패: ${error.message}` } },
        { status: 500 }
      );
    }

    // 업로드된 이미지 URL 가져오기
    const { data: urlData } = supabaseAdmin.storage
      .from('projects')
      .getPublicUrl(fileName);
    
    console.log('파일 업로드 성공, 공개 URL:', urlData.publicUrl);

    return NextResponse.json({ 
      success: true,
      publicUrl: urlData.publicUrl
    });
  } catch (error: any) {
    console.error('서버 업로드 에러:', error);
    return NextResponse.json(
      { error: { message: error.message || '서버 에러가 발생했습니다.' } },
      { status: 500 }
    );
  }
} 