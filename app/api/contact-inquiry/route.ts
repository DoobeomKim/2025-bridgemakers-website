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
    
    // 요청 바디 파싱
    const body: ContactInquiryRequest = await request.json();
    console.log('📝 받은 데이터:', { ...body, privacyConsent: body.privacyConsent });

    // 🔍 필수 필드 검증
    const requiredFields = ['inquiryType', 'clientType', 'name', 'email', 'phone', 'content', 'privacyConsent'];
    for (const field of requiredFields) {
      if (!body[field as keyof ContactInquiryRequest]) {
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
    const supabase = createServerClient();

    // 클라이언트 IP 주소 가져오기
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

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

    console.log('💾 DB 삽입 데이터:', inquiryData);

    const { data: inquiry, error: insertError } = await supabase
      .from('contact_inquiries')
      .insert(inquiryData)
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('❌ DB 삽입 실패:', insertError);
      return NextResponse.json(
        { 
          error: 'DATABASE_ERROR', 
          message: '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.',
          details: insertError.message
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
    console.error('❌ Contact Inquiry API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'INTERNAL_ERROR', 
        message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
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