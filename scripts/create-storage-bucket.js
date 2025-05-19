#!/usr/bin/env node

// Supabase 스토리지 버킷 생성 스크립트
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

async function createBucket() {
  try {
    // 버킷이 이미 존재하는지 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`버킷 목록 조회 오류: ${listError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`"${bucketName}" 버킷이 이미 존재합니다.`);
      
      // 버킷 정책 업데이트
      await updateBucketPolicy(bucketName);
      return;
    }
    
    // 버킷 생성
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true, // 공개 접근 가능
      fileSizeLimit: 10485760, // 10MB 제한
    });
    
    if (error) {
      throw new Error(`버킷 생성 오류: ${error.message}`);
    }
    
    console.log(`"${bucketName}" 버킷이 성공적으로 생성되었습니다.`);
    
    // 생성된 버킷의 정책 설정
    await updateBucketPolicy(bucketName);
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    process.exit(1);
  }
}

async function updateBucketPolicy(bucket) {
  try {
    // 프로젝트 썸네일 폴더에 대한 정책 업데이트
    const { error } = await supabase.storage.from(bucket).updateBucketPolicy('project-thumbnails/*', true);
    
    if (error) {
      throw new Error(`버킷 정책 업데이트 오류: ${error.message}`);
    }
    
    console.log(`"${bucket}" 버킷의 정책이 업데이트되었습니다.`);
  } catch (error) {
    console.error('버킷 정책 업데이트 오류:', error.message);
  }
}

// 실행
createBucket()
  .then(() => console.log('스크립트 실행 완료'))
  .catch(err => console.error('스크립트 실행 오류:', err)); 