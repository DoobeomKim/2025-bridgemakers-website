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

async function checkProjects() {
  console.log('프로젝트 데이터 확인 중...');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .limit(10);

  if (error) {
    console.error('오류가 발생했습니다:', error);
    return;
  }

  console.log('프로젝트 데이터 개수:', data.length);
  if (data.length > 0) {
    console.log('첫 번째 프로젝트 제목:', data[0].title);
    console.log('첫 번째 프로젝트 ID:', data[0].id);
  } else {
    console.log('데이터가 없습니다.');
  }
}

checkProjects(); 