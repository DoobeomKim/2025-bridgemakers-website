-- 샘플 프로젝트 데이터 삽입

-- 태그 데이터 추가
INSERT INTO project_tags (id, name, slug, created_at)
VALUES
  (gen_random_uuid(), 'BX', 'bx', now()),
  (gen_random_uuid(), 'NEXON', 'nexon', now()),
  (gen_random_uuid(), 'IT/통신/전자', 'it-telecom-electronics', now()),
  (gen_random_uuid(), '교육/엔터테인먼트', 'education-entertainment', now()),
  (gen_random_uuid(), 'SUDDEN ATTACK', 'sudden-attack', now()),
  (gen_random_uuid(), '슈퍼바이브', 'supervive', now());

-- 태그 ID 변수 저장
DO $$
DECLARE
  tag_bx UUID;
  tag_nexon UUID;
  tag_it UUID;
  tag_edu UUID;
  tag_sudden UUID;
  tag_supervive UUID;
  
  -- 프로젝트 ID 변수
  project1_id UUID;
  project2_id UUID;
  project3_id UUID;
  project4_id UUID;
  project5_id UUID;
  project6_id UUID;
BEGIN
  -- 태그 ID 조회
  SELECT id INTO tag_bx FROM project_tags WHERE slug = 'bx';
  SELECT id INTO tag_nexon FROM project_tags WHERE slug = 'nexon';
  SELECT id INTO tag_it FROM project_tags WHERE slug = 'it-telecom-electronics';
  SELECT id INTO tag_edu FROM project_tags WHERE slug = 'education-entertainment';
  SELECT id INTO tag_sudden FROM project_tags WHERE slug = 'sudden-attack';
  SELECT id INTO tag_supervive FROM project_tags WHERE slug = 'supervive';

  -- 프로젝트 1: 유럽 의료기기 홍보 웹사이트
  INSERT INTO projects (
    id, title, slug, description, content, category, client, 
    date, country, industry, service, image_url, is_featured
  )
  VALUES (
    gen_random_uuid(),
    '유럽 의료기기 홍보 웹사이트',
    'medical-website',
    '독일 의료기기 회사를 위한 반응형 웹사이트 개발 및 디자인 프로젝트입니다. 다국어 지원과 제품 카탈로그를 구현했습니다.',
    '<p>Medical Deutschland GmbH는 유럽 시장을 선도하는 의료기기 제조업체로, 글로벌 시장 진출을 위한 웹사이트 리뉴얼이 필요했습니다.</p>
     <p>Bridge Makers는 다국어 지원(독일어, 영어, 프랑스어, 스페인어)과 함께 직관적인 제품 카탈로그 시스템을 구현했습니다. 반응형 디자인으로 모든 디바이스에서 최적화된 경험을 제공합니다.</p>
     <p>주요 기능:</p>
     <ul>
       <li>다국어 지원 시스템</li>
       <li>제품 카탈로그 및 검색 기능</li>
       <li>문의 및 견적 요청 시스템</li>
       <li>의료진을 위한 전용 자료 다운로드 섹션</li>
     </ul>',
    '웹 디자인 & 개발',
    'Medical Deutschland GmbH',
    '2023-08-15',
    'Germany',
    'Healthcare',
    'BX',
    '/images/project-1.jpg',
    true
  )
  RETURNING id INTO project1_id;

  -- 프로젝트 1 추가 이미지
  INSERT INTO project_images (project_id, image_url, sort_order)
  VALUES
    (project1_id, '/images/project-1.jpg', 0),
    (project1_id, '/images/project-2.jpg', 1);

  -- 프로젝트 1 태그 관계
  INSERT INTO project_tag_relations (project_id, tag_id)
  VALUES
    (project1_id, tag_bx),
    (project1_id, tag_it);

  -- 프로젝트 2: SaaS 플랫폼 랜딩 페이지
  INSERT INTO projects (
    id, title, slug, description, content, category, client, 
    date, country, industry, service, image_url, is_featured
  )
  VALUES (
    gen_random_uuid(),
    'SaaS 플랫폼 랜딩 페이지',
    'saas-landing',
    '스타트업 고객을 위한 최신 트렌드를 반영한 SaaS 플랫폼 랜딩 페이지 디자인 프로젝트입니다.',
    '<p>Genius SaaS는 기업용 협업 솔루션을 제공하는 스타트업으로, 제품 출시를 위한 효과적인 랜딩 페이지가 필요했습니다.</p>
     <p>Bridge Makers는 현대적인 디자인과 사용자 경험에 중점을 둔 랜딩 페이지를 디자인하여 높은 전환율을 달성했습니다.</p>
     <p>주요 특징:</p>
     <ul>
       <li>모던하고 깔끔한 UI/UX 디자인</li>
       <li>제품 기능 소개 섹션</li>
       <li>가격 정책 비교 테이블</li>
       <li>고객 리뷰 및 성공 사례</li>
       <li>데모 신청 및 뉴스레터 구독 폼</li>
     </ul>',
    '웹 디자인',
    'Genius SaaS',
    '2024-01-20',
    'Netherlands',
    'Technology',
    'BX',
    '/images/project-2.jpg',
    true
  )
  RETURNING id INTO project2_id;

  -- 프로젝트 2 추가 이미지
  INSERT INTO project_images (project_id, image_url, sort_order)
  VALUES
    (project2_id, '/images/project-2.jpg', 0),
    (project2_id, '/images/project-4.jpg', 1);

  -- 프로젝트 2 태그 관계
  INSERT INTO project_tag_relations (project_id, tag_id)
  VALUES
    (project2_id, tag_bx),
    (project2_id, tag_it);

  -- 프로젝트 3: 네덜란드 기업 홍보영상
  INSERT INTO projects (
    id, title, slug, description, content, category, client, 
    date, country, industry, service, image_url, is_featured
  )
  VALUES (
    gen_random_uuid(),
    '네덜란드 기업 홍보영상',
    'tech-wave-video',
    '네덜란드 현지 기업의 제품 소개 및 기업 홍보를 위한 영상 촬영 및 편집 프로젝트입니다.',
    '<p>TechWave BV는 혁신적인 IoT 솔루션을 제공하는 네덜란드 기업으로, 신제품 출시에 맞춰 회사와 제품을 소개하는 홍보 영상이 필요했습니다.</p>
     <p>Bridge Makers는 현지 촬영팀과 협업하여 고품질의 기업 홍보 영상을 제작했습니다.</p>
     <p>프로젝트 내용:</p>
     <ul>
       <li>컨셉 기획 및 시나리오 작성</li>
       <li>현지 촬영 코디네이션</li>
       <li>인터뷰 및 제품 시연 촬영</li>
       <li>모션 그래픽 및 특수 효과</li>
       <li>음향 디자인 및 믹싱</li>
       <li>다국어 자막 처리</li>
     </ul>
     <p>최종 결과물은 회사 웹사이트, 소셜 미디어, 전시회 등 다양한 채널에서 활용되고 있습니다.</p>',
    '영상 제작',
    'TechWave BV',
    '2023-09-10',
    'Netherlands',
    'Technology',
    'NEXON',
    '/images/project-3.jpg',
    false
  )
  RETURNING id INTO project3_id;

  -- 프로젝트 3 추가 이미지
  INSERT INTO project_images (project_id, image_url, sort_order)
  VALUES
    (project3_id, '/images/project-3.jpg', 0),
    (project3_id, '/images/project-1.jpg', 1);

  -- 프로젝트 3 태그 관계
  INSERT INTO project_tag_relations (project_id, tag_id)
  VALUES
    (project3_id, tag_nexon),
    (project3_id, tag_edu);

  -- 프로젝트 4: 비즈니스 포트폴리오 웹사이트
  INSERT INTO projects (
    id, title, slug, description, content, category, client, 
    date, country, industry, service, image_url, is_featured
  )
  VALUES (
    gen_random_uuid(),
    '비즈니스 포트폴리오 웹사이트',
    'investment-portfolio',
    '투자 컨설팅 회사를 위한 고급스러운 포트폴리오 웹사이트 디자인 및 개발 프로젝트입니다.',
    '<p>European Investment Partners는 유럽 전역에서 투자 컨설팅 서비스를 제공하는 회사로, 전문성과 신뢰성을 강조하는 웹사이트가 필요했습니다.</p>
     <p>Bridge Makers는 고급스러운 디자인과 직관적인 사용자 경험을 결합한 포트폴리오 웹사이트를 개발했습니다.</p>
     <p>주요 기능:</p>
     <ul>
       <li>투자 포트폴리오 쇼케이스</li>
       <li>투자 성과 시각화 차트</li>
       <li>투자자 전용 로그인 영역</li>
       <li>투자 세미나 및 이벤트 예약 시스템</li>
       <li>다국어 지원 (영어, 프랑스어, 독일어)</li>
     </ul>
     <p>고객의 브랜드 아이덴티티를 완벽하게 반영한 디자인으로 사용자들에게 전문적인 이미지를 전달합니다.</p>',
    '웹 디자인 & 개발',
    'European Investment Partners',
    '2024-02-05',
    'Belgium',
    'Finance',
    'BX',
    '/images/project-4.jpg',
    true
  )
  RETURNING id INTO project4_id;

  -- 프로젝트 4 추가 이미지
  INSERT INTO project_images (project_id, image_url, sort_order)
  VALUES
    (project4_id, '/images/project-4.jpg', 0),
    (project4_id, '/images/project-3.jpg', 1);

  -- 프로젝트 4 태그 관계
  INSERT INTO project_tag_relations (project_id, tag_id)
  VALUES
    (project4_id, tag_bx),
    (project4_id, tag_it);

  -- 프로젝트 5: 컨퍼런스 이벤트 영상
  INSERT INTO projects (
    id, title, slug, description, content, category, client, 
    date, country, industry, service, image_url, is_featured
  )
  VALUES (
    gen_random_uuid(),
    '컨퍼런스 이벤트 영상',
    'tech-conference',
    '유럽 연례 기술 컨퍼런스의 하이라이트 영상 및 세션별 촬영 프로젝트입니다.',
    '<p>EU Tech Conference는 유럽 최대 규모의 기술 컨퍼런스로, 3일간 진행된 다양한 세션과 행사의 영상 기록이 필요했습니다.</p>
     <p>Bridge Makers는 현장에서 전체 행사를 촬영하고 하이라이트 영상과 세션별 영상을 제작했습니다.</p>
     <p>프로젝트 범위:</p>
     <ul>
       <li>메인 스테이지 및 서브 스테이지 세션 촬영</li>
       <li>연사 인터뷰 및 참가자 인터뷰</li>
       <li>행사 하이라이트 영상 제작</li>
       <li>각 세션별 개별 영상 편집</li>
       <li>라이브 스트리밍 지원</li>
     </ul>
     <p>최종 영상은 다음 행사 홍보 및 컨퍼런스 아카이브 자료로 활용되고 있습니다.</p>',
    '영상 제작',
    'EU Tech Conference',
    '2023-11-20',
    'France',
    'Events',
    'NEXON',
    '/images/project-2.jpg',
    false
  )
  RETURNING id INTO project5_id;

  -- 프로젝트 5 추가 이미지
  INSERT INTO project_images (project_id, image_url, sort_order)
  VALUES
    (project5_id, '/images/project-2.jpg', 0),
    (project5_id, '/images/project-1.jpg', 1);

  -- 프로젝트 5 태그 관계
  INSERT INTO project_tag_relations (project_id, tag_id)
  VALUES
    (project5_id, tag_nexon),
    (project5_id, tag_edu);

  -- 프로젝트 6: 브랜드 아이덴티티 리뉴얼
  INSERT INTO projects (
    id, title, slug, description, content, category, client, 
    date, country, industry, service, image_url, is_featured
  )
  VALUES (
    gen_random_uuid(),
    '브랜드 아이덴티티 리뉴얼',
    'beauty-brand',
    '프랑스 화장품 브랜드의 아이덴티티 리뉴얼 및 웹사이트 디자인 프로젝트입니다.',
    '<p>Beauté Paris는 프랑스의 전통적인 화장품 브랜드로, 젊은 소비자층을 타겟팅하기 위한 브랜드 아이덴티티 리뉴얼이 필요했습니다.</p>
     <p>Bridge Makers는 브랜드의 전통적인 가치를 유지하면서도 현대적인 감각을 더한 브랜드 아이덴티티와 웹사이트를 디자인했습니다.</p>
     <p>프로젝트 내용:</p>
     <ul>
       <li>로고 리디자인</li>
       <li>컬러 팔레트 및 타이포그래피 가이드라인</li>
       <li>제품 패키지 디자인</li>
       <li>브랜드 웹사이트 리디자인</li>
       <li>소셜 미디어 컨텐츠 템플릿</li>
     </ul>
     <p>리뉴얼 후 젊은 소비자층의 유입이 30% 증가하고 전체 매출이 25% 상승하는 성과를 거두었습니다.</p>',
    '브랜딩',
    'Beauté Paris',
    '2024-03-10',
    'France',
    'Beauty',
    'BX',
    '/images/project-3.jpg',
    true
  )
  RETURNING id INTO project6_id;

  -- 프로젝트 6 추가 이미지
  INSERT INTO project_images (project_id, image_url, sort_order)
  VALUES
    (project6_id, '/images/project-3.jpg', 0),
    (project6_id, '/images/project-4.jpg', 1);

  -- 프로젝트 6 태그 관계
  INSERT INTO project_tag_relations (project_id, tag_id)
  VALUES
    (project6_id, tag_bx),
    (project6_id, tag_it);

END $$; 