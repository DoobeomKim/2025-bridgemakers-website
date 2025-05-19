const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunctionExists() {
  console.log('get_related_projects 함수 검사 중...');

  // 함수 존재 여부 확인을 위한 메타데이터 쿼리
  const { data, error } = await supabase
    .rpc('get_related_projects', {
      project_id: '00000000-0000-0000-0000-000000000000', // 의도적으로 존재하지 않는 ID 사용
      limit_count: 1
    });

  if (error) {
    console.error('함수 호출 중 오류 발생:', error);
    if (error.code === 'PGRST202') {
      console.error('함수가 존재하지 않거나 적절한 권한이 없습니다.');
    }
    return;
  }

  console.log('함수가 정상적으로 존재합니다.');
  console.log('결과 데이터:', data);
}

// 확인을 위한 일반 쿼리 실행
async function testSimpleQuery() {
  console.log('기본 쿼리 테스트 중...');
  
  const { data, error } = await supabase
    .from('projects')
    .select('id, title')
    .limit(1);

  if (error) {
    console.error('기본 쿼리 오류:', error);
    return;
  }

  console.log('기본 쿼리 성공:', data);
}

// 실행
async function runTests() {
  try {
    await testSimpleQuery();
    await checkFunctionExists();
  } catch (err) {
    console.error('테스트 중 예외 발생:', err);
  }
}

runTests(); 