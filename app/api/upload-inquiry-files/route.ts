import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const MAX_FILES_PER_INQUIRY = 5;

export async function POST(request: NextRequest) {
  try {
    console.log('📁 파일 업로드 API 시작');

    // FormData 파싱
    const formData = await request.formData();
    const inquiryId = formData.get('inquiryId') as string;
    const files = formData.getAll('files') as File[];

    // 🔍 기본 검증
    if (!inquiryId) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '문의 ID가 필요합니다.' 
        },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: '업로드할 파일이 없습니다.' 
        },
        { status: 400 }
      );
    }

    // 파일 개수 제한 확인
    if (files.length > MAX_FILES_PER_INQUIRY) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: `최대 ${MAX_FILES_PER_INQUIRY}개의 파일만 업로드할 수 있습니다.` 
        },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 현재 사용자 정보 확인 (디버깅용)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 현재 사용자 정보:', { user: user?.email || 'anonymous', error: authError?.message });

    // 기존 파일 개수 확인
    const { count: existingFileCount, error: countError } = await supabase
      .from('inquiry_files')
      .select('*', { count: 'exact', head: true })
      .eq('inquiry_id', inquiryId);

    if (countError) {
      console.error('❌ 기존 파일 개수 확인 실패:', countError);
      return NextResponse.json(
        { 
          error: 'DATABASE_ERROR', 
          message: '파일 업로드 중 오류가 발생했습니다.' 
        },
        { status: 500 }
      );
    }

    // 총 파일 개수 제한 확인
    const totalFileCount = (existingFileCount || 0) + files.length;
    if (totalFileCount > MAX_FILES_PER_INQUIRY) {
      return NextResponse.json(
        { 
          error: 'VALIDATION_ERROR', 
          message: `문의당 최대 ${MAX_FILES_PER_INQUIRY}개의 파일만 첨부할 수 있습니다. (현재: ${existingFileCount}개)` 
        },
        { status: 400 }
      );
    }

    const uploadResults = [];
    const errors = [];

    // 각 파일 처리
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // 🔍 파일 검증
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            fileName: file.name,
            error: `파일 크기가 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`
          });
          continue;
        }

        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
          errors.push({
            fileName: file.name,
            error: `허용되지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')}만 허용)`
          });
          continue;
        }

        // 📁 Supabase Storage에 파일 업로드
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `inquiry-files/${inquiryId}/${timestamp}_${randomString}_${sanitizedFileName}`;

        console.log(`📤 파일 업로드 시작: ${file.name} -> ${storagePath}`);

        // 서비스 역할로 스토리지 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('inquiry-attachments')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`❌ 파일 업로드 실패 (${file.name}):`, uploadError);
          errors.push({
            fileName: file.name,
            error: `스토리지 업로드 실패: ${uploadError.message}`
          });
          continue;
        }

        // 🗃️ 파일 정보를 데이터베이스에 저장
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';

        const fileData = {
          inquiry_id: inquiryId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_extension: fileExtension,
          storage_path: uploadData.path,
          uploaded_by_ip: clientIP
        };

        console.log('💾 파일 정보 DB 저장 시도:', { inquiry_id: inquiryId, file_name: file.name });

        // 서비스 역할로 RLS 우회하여 저장
        const { data: fileRecord, error: dbError } = await supabase
          .from('inquiry_files')
          .insert(fileData)
          .select('id, file_name, file_size')
          .single();

        if (dbError) {
          console.error(`❌ 파일 DB 저장 실패 (${file.name}):`, dbError);
          
          // 스토리지에서 업로드된 파일 삭제
          await supabase.storage
            .from('inquiry-attachments')
            .remove([uploadData.path]);

          errors.push({
            fileName: file.name,
            error: `데이터베이스 저장 실패: ${dbError.message}`
          });
          continue;
        }

        uploadResults.push({
          id: fileRecord.id,
          fileName: fileRecord.file_name,
          fileSize: fileRecord.file_size,
          status: 'success'
        });

        console.log(`✅ 파일 업로드 완료: ${file.name}`);

      } catch (error) {
        console.error(`❌ 파일 처리 중 예상치 못한 오류 (${file.name}):`, error);
        errors.push({
          fileName: file.name,
          error: '파일 처리 중 예상치 못한 오류가 발생했습니다.'
        });
      }
    }

    // 📊 결과 응답
    const hasErrors = errors.length > 0;
    const hasSuccesses = uploadResults.length > 0;

    if (!hasSuccesses && hasErrors) {
      // 모든 파일 업로드 실패
      return NextResponse.json(
        { 
          error: 'UPLOAD_FAILED', 
          message: '모든 파일 업로드에 실패했습니다.',
          errors
        },
        { status: 400 }
      );
    }

    // 부분 성공 또는 전체 성공
    return NextResponse.json({
      success: true,
      message: hasErrors 
        ? '일부 파일 업로드가 완료되었습니다.'
        : '모든 파일 업로드가 완료되었습니다.',
      uploadedFiles: uploadResults,
      errors: hasErrors ? errors : undefined,
      totalUploaded: uploadResults.length,
      totalFailed: errors.length
    }, { status: hasErrors ? 207 : 200 }); // 207: Multi-Status

  } catch (error) {
    console.error('❌ File Upload API Error:', error);
    
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