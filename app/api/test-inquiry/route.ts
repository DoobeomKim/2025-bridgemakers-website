import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 테스트 문의 API 시작');

    const supabase = createServerClient();
    
    // 테스트 데이터 생성
    const testData = {
      inquiry_type: 'general',
      client_type: 'individual',
      name: '테스트 사용자',
      email: 'test@example.com',
      phone: '01012345678',
      company_name: null,
      selected_fields: null,
      budget: null,
      project_date: null,
      content: '이것은 API 테스트용 문의입니다.',
      privacy_consent: true,
      status: 'pending'
    };

    console.log('📤 테스트 데이터 삽입 시도:', testData);

    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert(testData)
      .select('id, created_at')
      .single();

    if (error) {
      console.error('❌ 테스트 데이터 삽입 실패:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      return NextResponse.json({
        success: false,
        error: 'INSERT_FAILED',
        details: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        }
      }, { status: 500 });
    }

    console.log('✅ 테스트 데이터 삽입 성공:', data);

    // 테스트 데이터 즉시 삭제 (실제 데이터가 아니므로)
    const { error: deleteError } = await supabase
      .from('contact_inquiries')
      .delete()
      .eq('id', data.id);

    if (deleteError) {
      console.warn('⚠️ 테스트 데이터 삭제 실패 (데이터는 정상 생성됨):', deleteError);
    } else {
      console.log('🧹 테스트 데이터 삭제 완료');
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 및 테이블 작동 정상',
      testResult: {
        inserted: data,
        deletedAfterTest: !deleteError
      }
    });

  } catch (error) {
    console.error('❌ 테스트 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'TEST_ERROR',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 