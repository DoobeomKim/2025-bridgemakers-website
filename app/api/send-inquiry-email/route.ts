import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// 이메일 발송을 위한 Nodemailer 설정 (Ionos SMTP 사용)
interface EmailRequest {
  inquiryId?: string;
  email?: string;
  emailType: 'admin_notification' | 'customer_confirmation';
}

interface InquiryDetails {
  id: string;
  inquiry_type: string;
  client_type: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  selected_fields?: string[];
  budget?: string;
  project_date?: string;
  content: string;
  created_at: string;
}

// Nodemailer transporter 생성
const createTransporter = () => {
  // Gmail SMTP 임시 설정 (테스트용)
  if (process.env.USE_GMAIL_SMTP === 'true') {
    const gmailConfig = {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // your-email@gmail.com
        pass: process.env.GMAIL_PASS, // 앱 비밀번호
      }
    };
    
    console.log('📧 Gmail SMTP 설정 사용');
    
    return nodemailer.createTransport(gmailConfig);
  }

  // Ionos SMTP 설정
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.ionos.de',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // 587포트는 STARTTLS 사용
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // 인증서 문제 해결
    }
  };

  return nodemailer.createTransport(smtpConfig);
};

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 이메일 발송 API 호출됨');
    
    const body: EmailRequest = await request.json();
    const { inquiryId, email, emailType } = body;

    // Supabase 클라이언트 생성 (서비스 롤 사용)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    let inquiry: InquiryDetails;

    if (inquiryId) {
      // inquiryId로 조회
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .single();

      if (error || !data) {
        console.error('❌ 문의 정보 조회 실패:', error);
        return NextResponse.json(
          { success: false, error: '문의 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      inquiry = data;
    } else if (email) {
      // 이메일로 가장 최근 문의 조회
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error('❌ 이메일로 문의 정보 조회 실패:', error);
        return NextResponse.json(
          { success: false, error: '해당 이메일의 문의 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      inquiry = data;
    } else {
      return NextResponse.json(
        { success: false, error: 'inquiryId 또는 email이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📧 문의 정보 조회 성공:', { id: inquiry.id, email: inquiry.email });

    // 관리자 알림 이메일 발송
    if (emailType === 'admin_notification' || !emailType) {
      try {
        const subject = `[브릿지메이커스] 새로운 ${inquiry.inquiry_type === 'general' ? '일반' : '견적'} 문의`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #0c1526;">새로운 문의가 접수되었습니다</h2>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>문의 정보</h3>
              <p><strong>문의 유형:</strong> ${inquiry.inquiry_type === 'general' ? '일반 문의' : '견적 문의'}</p>
              <p><strong>고객 유형:</strong> ${inquiry.client_type === 'individual' ? '개인' : '법인'}</p>
              <p><strong>이름:</strong> ${inquiry.name}</p>
              <p><strong>이메일:</strong> ${inquiry.email}</p>
              <p><strong>전화번호:</strong> ${inquiry.phone}</p>
              ${inquiry.company_name ? `<p><strong>회사명:</strong> ${inquiry.company_name}</p>` : ''}
              ${inquiry.selected_fields && inquiry.selected_fields.length > 0 ? 
                `<p><strong>관심 분야:</strong> ${inquiry.selected_fields.join(', ')}</p>` : ''}
              ${inquiry.budget ? `<p><strong>예산:</strong> ${inquiry.budget}</p>` : ''}
              ${inquiry.project_date ? `<p><strong>희망 시작일:</strong> ${inquiry.project_date}</p>` : ''}
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
              <h3>문의 내용</h3>
              <p style="white-space: pre-wrap;">${inquiry.content}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #cba967; color: white; border-radius: 8px;">
              <p><strong>접수 시간:</strong> ${new Date(inquiry.created_at).toLocaleString('ko-KR')}</p>
              <p><strong>문의 ID:</strong> ${inquiry.id}</p>
            </div>
          </div>
        `;

        // 실제 이메일 발송 (Ionos SMTP 사용)
        const transporter = createTransporter();
        
        // SMTP 연결 테스트
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          console.log('📧 관리자 알림 이메일 발송 중...');
          
          const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@ibridgemakers.de',
            to: ['doobeom@ibridgemakers.de'], // 관리자 이메일 목록
            subject,
            html: htmlContent
          });

          console.log('✅ 관리자 이메일 발송 완료');
        } else {
          console.log('📧 [DEMO] 관리자 알림 이메일 (SMTP 설정 없음)');
        }
      } catch (error) {
        console.error('❌ 관리자 이메일 발송 실패:', error);
        return NextResponse.json(
          { success: false, error: '관리자 이메일 발송에 실패했습니다.', details: error },
          { status: 500 }
        );
      }
    }

    // 고객 확인 이메일 발송
    if (emailType === 'customer_confirmation' || !emailType) {
      try {
        const subject = `[브릿지메이커스] 문의 접수 확인`;
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0c1526;">브릿지메이커스</h1>
              <p style="color: #cba967; font-size: 18px;">문의 접수 확인</p>
            </div>
            
            <p>안녕하세요, ${inquiry.name}님</p>
            
            <p>브릿지메이커스에 문의해 주셔서 감사합니다.<br>
            귀하의 문의가 정상적으로 접수되었습니다.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>접수된 문의 정보</h3>
              <p><strong>문의 유형:</strong> ${inquiry.inquiry_type === 'general' ? '일반 문의' : '견적 문의'}</p>
              <p><strong>접수 번호:</strong> ${inquiry.id}</p>
              <p><strong>접수 시간:</strong> ${new Date(inquiry.created_at).toLocaleString('ko-KR')}</p>
              ${inquiry.project_date ? `<p><strong>희망 시작일:</strong> ${inquiry.project_date}</p>` : ''}
            </div>
            
            <div style="background: #0c1526; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #cba967;">처리 안내</h3>
              <p>• 담당자가 검토 후 <strong>24시간 이내</strong>에 연락드리겠습니다.</p>
              <p>• 긴급한 문의는 전화로 연락 주시기 바랍니다.</p>
              <p>• 추가 문의 사항이 있으시면 언제든 연락해 주세요.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 2px solid #cba967;">
              <p><strong>브릿지메이커스</strong></p>
              <p>이메일: doobeom@ibridgemakers.de</p>
              <p>웹사이트: https://ibridgemakers.de</p>
            </div>
          </div>
        `;

        // 실제 이메일 발송 (Ionos SMTP 사용)
        const transporter = createTransporter();
        
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          console.log('📧 고객 확인 이메일 발송 중...');
          
          const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@ibridgemakers.de',
            to: [inquiry.email],
            subject,
            html: htmlContent
          });

          console.log('✅ 고객 이메일 발송 완료');
        } else {
          console.log('📧 [DEMO] 고객 확인 이메일 (SMTP 설정 없음)');
        }
      } catch (error) {
        console.error('❌ 고객 이메일 발송 실패:', error);
        return NextResponse.json(
          { success: false, error: '고객 이메일 발송에 실패했습니다.', details: error },
          { status: 500 }
        );
      }
    }

    console.log('✅ 이메일 발송 완료');
    return NextResponse.json({ 
      success: true, 
      message: '이메일이 성공적으로 발송되었습니다.',
      inquiry: {
        id: inquiry.id,
        email: inquiry.email,
        name: inquiry.name
      }
    });

  } catch (error) {
    console.error('❌ 이메일 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.', details: error },
      { status: 500 }
    );
  }
} 