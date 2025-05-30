import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface ContactInquiryRequest {
  inquiryType: 'quote' | 'general';
  clientType: 'individual' | 'company';
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  fields?: string[];
  budget?: string;
  projectDate?: string;
  content: string;
  privacyConsent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 문의 접수 API 시작');
    console.log('🌍 환경 정보:', {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      vercelEnv: process.env.VERCEL_ENV,
    });
    
    // 요청 바디 파싱
    let body: ContactInquiryRequest;
    try {
      body = await request.json();
      console.log('📝 받은 데이터 타입:', {
        inquiryType: typeof body.inquiryType,
        name: typeof body.name,
        email: typeof body.email,
        privacyConsent: typeof body.privacyConsent
      });
    } catch (parseError) {
      console.error('❌ 요청 바디 파싱 실패:', parseError);
      return NextResponse.json(
        { 
          error: 'PARSE_ERROR', 
          message: '요청 데이터 형식이 올바르지 않습니다.',
          details: parseError instanceof Error ? parseError.message : String(parseError)
        },
        { status: 400 }
      );
    }

    // 🔍 필수 필드 검증
    const requiredFields = ['inquiryType', 'clientType', 'name', 'email', 'phone', 'content', 'privacyConsent'];
    for (const field of requiredFields) {
      if (!body[field as keyof ContactInquiryRequest]) {
        console.error(`❌ 필수 필드 누락: ${field}`, body[field as keyof ContactInquiryRequest]);
        return NextResponse.json(
          { 
            error: 'VALIDATION_ERROR', 
            message: `필수 필드가 누락되었습니다: ${field}`,
            field 
          },
          { status: 400 }
        );
      }
    }

    // 법인 선택시 회사명 필수 검증
    if (body.clientType === 'company' && !body.companyName) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '법인 선택시 회사명은 필수입니다.',
          field: 'companyName'
        },
        { status: 400 }
      );
    }

    // 견적문의시 분야 선택 필수 검증
    if (body.inquiryType === 'quote' && (!body.fields || body.fields.length === 0)) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '견적문의시 분야 선택은 필수입니다.',
          field: 'fields'
        },
        { status: 400 }
      );
    }

    // 개인정보 동의 검증
    if (!body.privacyConsent) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '개인정보 처리방침에 동의해주세요.',
          field: 'privacyConsent'
        },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '올바른 이메일 형식을 입력해주세요.',
          field: 'email'
        },
        { status: 400 }
      );
    }

    // 연락처 형식 검증 (숫자만, 10-15자리)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(body.phone.replace(/-/g, ''))) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '올바른 연락처를 입력해주세요. (10-15자리 숫자)',
          field: 'phone'
        },
        { status: 400 }
      );
    }

    // 📡 Supabase 클라이언트 생성
    let supabase;
    try {
      supabase = createServerClient();
      console.log('✅ Supabase 클라이언트 생성 완료');
    } catch (supabaseError) {
      console.error('❌ Supabase 클라이언트 생성 실패:', supabaseError);
      return NextResponse.json(
        { 
          error: 'CONNECTION_ERROR', 
          message: '데이터베이스 연결 중 오류가 발생했습니다.',
          details: supabaseError instanceof Error ? supabaseError.message : String(supabaseError)
        },
        { status: 500 }
      );
    }

    // 🗃️ 데이터베이스에 문의 정보 삽입
    const inquiryData = {
      inquiry_type: body.inquiryType,
      client_type: body.clientType,
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone.replace(/-/g, ''), // 하이픈 제거하여 저장
      company_name: body.companyName?.trim() || null,
      selected_fields: body.inquiryType === 'quote' ? body.fields : null,
      budget: body.budget || null,
      project_date: body.projectDate || null,
      content: body.content.trim(),
      privacy_consent: body.privacyConsent,
      status: 'pending'
    };

    console.log('💾 DB 삽입 데이터:', {
      ...inquiryData,
      content: `${inquiryData.content.substring(0, 50)}...`
    });

    const { data: inquiry, error: insertError } = await supabase
      .from('contact_inquiries')
      .insert(inquiryData)
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('❌ DB 삽입 실패:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return NextResponse.json(
        { 
          error: 'DATABASE_ERROR', 
          message: '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      );
    }

    console.log('✅ 문의 접수 완료:', inquiry);

    // 📊 성공 응답
    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.',
      inquiryId: inquiry.id,
      submittedAt: inquiry.created_at
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Contact Inquiry API Error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR', 
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}

// OPTIONS 메서드 처리 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 