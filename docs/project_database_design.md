# 프로젝트 상세 페이지를 위한 데이터베이스 설계

## 프로젝트 데이터베이스 설계

### 1. projects 테이블

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  client TEXT NOT NULL,
  date DATE NOT NULL,
  country TEXT NOT NULL,
  industry TEXT NOT NULL,
  service TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 자동으로 updated_at 값을 업데이트하는 트리거 추가
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

- **id**: 프로젝트 고유 식별자
- **title**: 프로젝트 제목
- **slug**: URL에 사용될 고유 식별자 (예: 'medical-website')
- **description**: 프로젝트 간단 설명
- **content**: 프로젝트 상세 내용
- **category**: 프로젝트 카테고리 (웹 디자인, 영상 제작 등)
- **client**: 클라이언트 이름
- **date**: 프로젝트 날짜
- **country**: 국가
- **industry**: 산업 분야 (IT/통신/전자 등)
- **service**: 제공 서비스 (BX, NEXON 등)
- **image_url**: 대표 이미지 URL
- **is_featured**: 특별 강조 프로젝트 여부
- **created_at**: 레코드 생성 시간
- **updated_at**: 레코드 업데이트 시간

### 2. project_images 테이블 (프로젝트 갤러리용)

```sql
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

- **id**: 이미지 고유 식별자
- **project_id**: 관련 프로젝트 ID
- **image_url**: 이미지 URL
- **sort_order**: 표시 순서
- **created_at**: 레코드 생성 시간

### 3. project_tags 테이블 (태그 정보 저장)

```sql
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

- **id**: 태그 고유 식별자
- **name**: 태그 이름 (BX, NEXON, IT/통신/전자 등)
- **slug**: URL용 태그 식별자
- **created_at**: 레코드 생성 시간

### 4. project_tag_relations 테이블 (프로젝트-태그 다대다 관계)

```sql
CREATE TABLE project_tag_relations (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);
```

- **project_id**: 프로젝트 ID
- **tag_id**: 태그 ID

### 5. 관련 프로젝트 조회 함수

```sql
CREATE OR REPLACE FUNCTION get_related_projects(project_id UUID, limit_count INTEGER DEFAULT 3)
RETURNS SETOF projects AS $$
DECLARE
  target_project projects%ROWTYPE;
BEGIN
  -- 대상 프로젝트 정보 가져오기
  SELECT * FROM projects WHERE id = project_id INTO target_project;
  
  -- 먼저 같은 카테고리의 프로젝트 반환
  RETURN QUERY
  SELECT p.* FROM projects p
  WHERE p.category = target_project.category
    AND p.id != project_id
  ORDER BY p.date DESC
  LIMIT limit_count;
  
  -- 충분한 결과가 없으면 같은 산업 분야의 프로젝트 추가
  IF NOT FOUND OR (SELECT COUNT(*) FROM projects p WHERE p.category = target_project.category AND p.id != project_id) < limit_count THEN
    RETURN QUERY
    SELECT p.* FROM projects p
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
    SELECT p.* FROM projects p
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
```

이 함수는 다음과 같은 우선순위로 관련 프로젝트를 동적으로 찾습니다:
1. 동일한 카테고리의 프로젝트
2. 동일한 산업 분야의 프로젝트
3. 최신 프로젝트

## 데이터베이스 관계 설명

1. **projects**: 모든 프로젝트의 주요 정보를 저장
2. **project_images**: 프로젝트의 추가 이미지들을 저장 (1:N 관계)
3. **project_tags**: 모든 태그 정보를 저장
4. **project_tag_relations**: 프로젝트와 태그 간의 다대다 관계를 관리

## 활용 방법

### 프로젝트 상세 페이지 데이터 조회

상세 페이지에 필요한 모든 정보를 가져오기 위한 쿼리:

```sql
-- 프로젝트 기본 정보 조회
SELECT p.*, array_agg(DISTINCT pt.name) as tags
FROM projects p
LEFT JOIN project_tag_relations ptr ON p.id = ptr.project_id
LEFT JOIN project_tags pt ON ptr.tag_id = pt.id
WHERE p.slug = 'medical-website'
GROUP BY p.id;

-- 프로젝트 이미지 조회
SELECT * FROM project_images
WHERE project_id = (SELECT id FROM projects WHERE slug = 'medical-website')
ORDER BY sort_order;

-- 관련 프로젝트 조회 (You Might Also Like)
SELECT * FROM get_related_projects(
  (SELECT id FROM projects WHERE slug = 'medical-website'), 
  3
);
```

### TypeScript 타입 정의

```typescript
// 데이터베이스 타입 확장
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  client: string;
  date: string;
  country: string;
  industry: string;
  service: string;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[]; // JOIN으로 가져온 태그들
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface ProjectTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProjectWithDetails extends Project {
  images: ProjectImage[];
  related_projects?: Project[];
}

// 데이터베이스 타입 정의 확장
export type Tables = {
  users: UserProfile;
  projects: Project;
  project_images: ProjectImage;
  project_tags: ProjectTag;
};
``` 