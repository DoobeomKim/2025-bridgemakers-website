#!/usr/bin/env node

// Supabase 스토리지 RLS 정책 설정 스크립트
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

async function setStoragePolicy() {
  try {
    console.log(`"${bucketName}" 버킷의 RLS 정책을 설정합니다...`);
    
    // SQL 쿼리를 직접 실행하여 스토리지 정책 설정
    const { error: policyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: bucketName,
    });
    
    if (policyError) {
      console.log('RPC 호출 실패, 수동 업데이트가 필요합니다.');
      console.log('오류:', policyError.message);
      
      // 버킷을 다시 공개로 설정해보기
      try {
        const { error: updateError } = await supabase.storage.updateBucket(
          bucketName,
          { public: true }
        );
        
        if (updateError) {
          console.log('버킷 업데이트 실패:', updateError.message);
        } else {
          console.log('버킷을 공개로 설정했습니다.');
        }
      } catch (err) {
        console.log('버킷 업데이트 중 오류 발생:', err.message);
      }
    } else {
      console.log('RPC 호출로 정책 설정 완료');
    }
    
    // 마지막 방법: 직접 SQL 쿼리 수동 실행 안내
    console.log('\n위 방법으로 해결이 안 된다면, Supabase 대시보드에서 다음 SQL 쿼리를 실행하세요:');
    console.log(`
      -- 모든 사용자가 객체를 읽을 수 있도록 허용
      DROP POLICY IF EXISTS "storage_${bucketName}_read_policy" ON storage.objects;
      CREATE POLICY "storage_${bucketName}_read_policy" ON storage.objects
        FOR SELECT USING (bucket_id = '${bucketName}');
      
      -- 모든 사용자가 객체를 업로드할 수 있도록 허용 (익명 사용자 포함)
      DROP POLICY IF EXISTS "storage_${bucketName}_insert_policy" ON storage.objects;
      CREATE POLICY "storage_${bucketName}_insert_policy" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = '${bucketName}');
      
      -- 모든 사용자가 객체를 수정할 수 있도록 허용
      DROP POLICY IF EXISTS "storage_${bucketName}_update_policy" ON storage.objects;
      CREATE POLICY "storage_${bucketName}_update_policy" ON storage.objects
        FOR UPDATE USING (bucket_id = '${bucketName}');
      
      -- 모든 사용자가 객체를 삭제할 수 있도록 허용
      DROP POLICY IF EXISTS "storage_${bucketName}_delete_policy" ON storage.objects;
      CREATE POLICY "storage_${bucketName}_delete_policy" ON storage.objects
        FOR DELETE USING (bucket_id = '${bucketName}');
    `);
    
  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

// 실행
setStoragePolicy()
  .then(() => console.log('스크립트 실행 완료'))
  .catch(err => console.error('스크립트 실행 오류:', err)); 