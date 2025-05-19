#!/usr/bin/env node

// Supabase 스토리지 버킷 정책 업데이트 스크립트
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const bucketName = 'projects';

async function makePublic() {
  try {
    // 버킷이 존재하는지 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`버킷 목록 조회 오류: ${listError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      throw new Error(`"${bucketName}" 버킷이 존재하지 않습니다.`);
    }
    
    // 버킷을 공개로 설정
    const { error: updateError } = await supabase.storage.updateBucket(
      bucketName,
      { public: true }
    );
    
    if (updateError) {
      throw new Error(`버킷 업데이트 오류: ${updateError.message}`);
    }
    
    console.log(`"${bucketName}" 버킷이 공개로 설정되었습니다.`);
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
makePublic()
  .then(() => console.log('스크립트 실행 완료'))
  .catch(err => console.error('스크립트 실행 오류:', err)); 