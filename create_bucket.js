// Supabase 버킷 생성 스크립트
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

// 환경 변수 또는 커맨드 라인 인자에서 Supabase URL과 서비스 롤 키를 가져옵니다.
const getArgValue = (argName) => {
  const argIndex = process.argv.findIndex(arg => arg.startsWith(`--${argName}=`));
  if (argIndex !== -1) {
    return process.argv[argIndex].split('=')[1];
  }
  return null;
};

// 커맨드 라인 인자 또는 환경 변수에서 값 가져오기
const supabaseUrl = getArgValue('url') || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = getArgValue('key') || process.env.SUPABASE_SERVICE_ROLE_KEY;

// 필수 값 확인
if (!supabaseServiceKey) {
  console.error('오류: SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  console.error('다음 방법 중 하나로 값을 제공하세요:');
  console.error('1. .env 파일에 SUPABASE_SERVICE_ROLE_KEY=your-key 추가');
  console.error('2. 커맨드 라인에서 --key=your-key 인자 전달');
  console.error('\n사용 예시: node create_bucket.js --url=your-url --key=your-key');
  console.error('\nSupabase 대시보드에서 Project Settings > API > Service Role Key를 확인하세요.');
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('오류: NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  console.error('다음 방법 중 하나로 값을 제공하세요:');
  console.error('1. .env 파일에 NEXT_PUBLIC_SUPABASE_URL=your-url 추가');
  console.error('2. 커맨드 라인에서 --url=your-url 인자 전달');
  console.error('\n사용 예시: node create_bucket.js --url=your-url --key=your-key');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('서비스 롤 키 사용 준비 완료');

// Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucketAndPolicies() {
  try {
    console.log('Supabase 스토리지 버킷 생성 시작...');

    // 1. 버킷 생성
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('user-assets', {
      public: true, // 공개 버킷으로 설정
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('user-assets 버킷이 이미 존재합니다.');
      } else {
        throw bucketError;
      }
    } else {
      console.log('user-assets 버킷이 성공적으로 생성되었습니다.');
    }

    // 2. profile-images 폴더 생성
    // 참고: Supabase Storage API에서는 빈 폴더를 직접 생성할 수 없으므로,
    // 임시 파일을 생성한 후 나중에 삭제하는 방식으로 구현합니다.
    
    const tempFilePath = 'profile-images/.folder';
    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(tempFilePath, Buffer.from('folder'), {
        upsert: true
      });

    if (uploadError) {
      console.error('폴더 생성 오류:', uploadError.message);
    } else {
      console.log('profile-images 폴더가 성공적으로 생성되었습니다.');
      
      // 임시 파일 삭제 (선택 사항)
      await supabase.storage.from('user-assets').remove([tempFilePath]);
    }

    // 3. 버킷 정보 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('버킷 목록 조회 오류:', listError.message);
    } else {
      console.log('현재 버킷 목록:', buckets.map(b => b.name).join(', '));
    }

    console.log('설정이 완료되었습니다.');
    console.log('\n접근 정책(Access Policies) 설정 안내:');
    console.log('Supabase UI의 Storage > user-assets > Policies에서 다음 정책들을 추가하세요:');
    console.log('\n1. 사용자 프로필 이미지 업로드 허용:');
    console.log('   - 대상: authenticated users');
    console.log('   - 작업: INSERT');
    console.log('   - 조건: bucket_id = \'user-assets\' AND STARTS_WITH(name, \'profile-images/\') AND position(auth.uid()::text in name) > 0');
    
    console.log('\n2. 프로필 이미지 공개 접근 허용:');
    console.log('   - 대상: public (anonymous users)');
    console.log('   - 작업: SELECT');
    console.log('   - 조건: bucket_id = \'user-assets\' AND STARTS_WITH(name, \'profile-images/\')');
    
    console.log('\n또는 supabase_storage_setup.sql 스크립트를 Supabase SQL 편집기에서 실행하세요.');

  } catch (error) {
    console.error('스토리지 설정 중 오류가 발생했습니다:', error.message);
  }
}

// 스크립트 실행
createBucketAndPolicies(); 