-- project_related 테이블이 이미 있다면 삭제
DROP TABLE IF EXISTS project_related CASCADE;

-- projects 테이블에 누락된 컬럼 추가 스크립트

-- 테이블 존재 여부 확인 및 컬럼 추가
DO $$ 
BEGIN
    -- projects 테이블이 존재하는지 확인
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
        -- status와 visibility 컬럼 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' NOT NULL;
        RAISE NOTICE 'status와 visibility 컬럼이 추가되었습니다.';
    ELSE
        RAISE NOTICE 'projects 테이블이 존재하지 않습니다.';
    END IF;
END $$;

-- 자동으로 updated_at 값을 업데이트하는 트리거 추가
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 프로젝트 이미지 테이블 생성
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 태그 테이블 생성
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 프로젝트-태그 다대다 관계 테이블
CREATE TABLE project_tag_relations (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

-- 관련 프로젝트를 찾는 함수 생성
CREATE OR REPLACE FUNCTION get_related_projects(project_id UUID, limit_count INTEGER DEFAULT 3)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  content TEXT,
  category TEXT,
  client TEXT,
  date DATE,
  country TEXT,
  industry TEXT,
  service TEXT,
  image_url TEXT,
  is_featured BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  target_project projects%ROWTYPE;
  supabase_url TEXT := current_setting('app.settings.supabase_url', TRUE);
BEGIN
  -- 대상 프로젝트 정보 가져오기
  SELECT * FROM projects WHERE id = project_id INTO target_project;
  
  -- 먼저 같은 카테고리의 프로젝트 반환
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.description,
    p.content,
    p.category,
    p.client,
    p.date,
    p.country,
    p.industry,
    p.service,
    CASE
      WHEN p.image_url LIKE 'http%' THEN p.image_url
      WHEN p.image_url LIKE '%/storage/v1/object/public/%' THEN p.image_url
      ELSE p.image_url
    END as image_url,
    p.is_featured,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.category = target_project.category
    AND p.id != project_id
  ORDER BY p.date DESC
  LIMIT limit_count;
  
  -- 충분한 결과가 없으면 같은 산업 분야의 프로젝트 추가
  IF NOT FOUND OR (SELECT COUNT(*) FROM projects p WHERE p.category = target_project.category AND p.id != project_id) < limit_count THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.title,
      p.slug,
      p.description,
      p.content,
      p.category,
      p.client,
      p.date,
      p.country,
      p.industry,
      p.service,
      CASE
        WHEN p.image_url LIKE 'http%' THEN p.image_url
        WHEN p.image_url LIKE '%/storage/v1/object/public/%' THEN p.image_url
        ELSE p.image_url
      END as image_url,
      p.is_featured,
      p.created_at,
      p.updated_at
    FROM projects p
    WHERE p.industry = target_project.industry
      AND p.id != project_id
      AND p.category != target_project.category
    ORDER BY p.date DESC
    LIMIT (limit_count - (SELECT COUNT(*) FROM projects p WHERE p.category = target_project.category AND p.id != project_id));
  END IF;
  
  -- 여전히 충분한 결과가 없으면 최신 프로젝트 추가
  IF (SELECT COUNT(*) FROM projects p 
      WHERE (p.category = target_project.category OR p.industry = target_project.industry)
      AND p.id != project_id) < limit_count THEN
    
    RETURN QUERY
    SELECT 
      p.id,
      p.title,
      p.slug,
      p.description,
      p.content,
      p.category,
      p.client,
      p.date,
      p.country,
      p.industry,
      p.service,
      CASE
        WHEN p.image_url LIKE 'http%' THEN p.image_url
        WHEN p.image_url LIKE '%/storage/v1/object/public/%' THEN p.image_url
        ELSE p.image_url
      END as image_url,
      p.is_featured,
      p.created_at,
      p.updated_at
    FROM projects p
    WHERE p.id != project_id
      AND p.category != target_project.category
      AND p.industry != target_project.industry
    ORDER BY p.date DESC
    LIMIT (limit_count - (SELECT COUNT(*) FROM projects p 
                         WHERE (p.category = target_project.category OR p.industry = target_project.industry)
                         AND p.id != project_id));
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- RLS(Row Level Security) 설정
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tag_relations ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (프로젝트, 이미지, 태그)
CREATE POLICY "Anyone can view projects" 
ON projects FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view project images" 
ON project_images FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view project tags" 
ON project_tags FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view project tags relations" 
ON project_tag_relations FOR SELECT 
USING (true);

-- 관리자만 수정 가능 정책
CREATE POLICY "Only admins can insert projects" 
ON projects FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

CREATE POLICY "Only admins can update projects" 
ON projects FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

CREATE POLICY "Only admins can delete projects" 
ON projects FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

-- 관리자 이미지 관리 정책
CREATE POLICY "Only admins can insert project images" 
ON project_images FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

CREATE POLICY "Only admins can update project images" 
ON project_images FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

CREATE POLICY "Only admins can delete project images" 
ON project_images FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

-- 관리자 태그 관리 정책
CREATE POLICY "Only admins can manage tags" 
ON project_tags FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

CREATE POLICY "Only admins can manage tag relations" 
ON project_tag_relations FOR ALL 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
); 
