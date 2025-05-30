import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 1️⃣ 환경변수 확인
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      // URL만 표시 (보안상 키는 있는지 여부만)
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...',
    };

    // 2️⃣ Supabase 연결 테스트
    let supabaseConnection = null;
    let supabaseError = null;
    
    try {
      const supabase = createServerClient();
      
      // 간단한 쿼리로 연결 테스트
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        supabaseError = {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        };
      } else {
        supabaseConnection = {
          status: 'success',
          timestamp: new Date().toISOString()
        };
      }
    } catch (connError) {
      supabaseError = {
        message: connError instanceof Error ? connError.message : String(connError),
        type: 'connection_error'
      };
    }

    // 3️⃣ 테이블 존재 확인
    let tableCheck = null;
    let tableError = null;
    
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .rpc('check_table_exists', { table_name: 'contact_inquiries' });
      
      if (error) {
        tableError = error.message;
      } else {
        tableCheck = { exists: true };
      }
    } catch (tableErr) {
      // RPC 함수가 없을 수 있으므로 다른 방법으로 확인
      try {
        const supabase = createServerClient();
        const { data, error } = await supabase
          .from('contact_inquiries')
          .select('id')
          .limit(1);
        
        tableCheck = { exists: !error };
        if (error) {
          tableError = error.message;
        }
      } catch (finalErr) {
        tableError = finalErr instanceof Error ? finalErr.message : String(finalErr);
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabase: {
        connection: supabaseConnection,
        error: supabaseError,
        table: tableCheck,
        tableError: tableError
      }
    });

  } catch (error) {
    console.error('❌ Debug API Error:', error);
    
    return NextResponse.json({
      error: 'debug_error',
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 