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

async function checkRelatedProjects() {
  // 먼저 프로젝트 하나 가져오기
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .limit(1);

  if (projectError) {
    console.error('프로젝트를 가져오는 중 오류 발생:', projectError);
    return;
  }

  if (!projects || projects.length === 0) {
    console.log('프로젝트가 없습니다.');
    return;
  }

  const project = projects[0];
  console.log('선택된 프로젝트:', project.title, '(ID:', project.id, ')');

  // 관련 프로젝트 조회
  console.log('관련 프로젝트 확인 중...');
  const { data: relatedProjects, error: relatedError } = await supabase
    .rpc('get_related_projects', {
      project_id: project.id,
      limit_count: 3
    });

  if (relatedError) {
    console.error('관련 프로젝트를 가져오는 중 오류 발생:', relatedError);
    return;
  }

  console.log('관련 프로젝트 개수:', relatedProjects ? relatedProjects.length : 0);
  
  if (relatedProjects && relatedProjects.length > 0) {
    console.log('관련 프로젝트 목록:');
    relatedProjects.forEach((relatedProject, index) => {
      console.log(`${index + 1}. ${relatedProject.title} (카테고리: ${relatedProject.category})`);
    });
  } else {
    console.log('관련 프로젝트가 없습니다.');
  }
}

checkRelatedProjects(); 