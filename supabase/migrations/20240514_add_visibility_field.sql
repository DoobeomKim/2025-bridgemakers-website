-- projects 테이블에 visibility 필드 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS visibility VARCHAR(10) DEFAULT 'private';

-- ENUM 타입 대신 CHECK 제약조건 사용 (visibility는 'public' 또는 'private'만 가능)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_visibility_check;
ALTER TABLE projects ADD CONSTRAINT projects_visibility_check 
  CHECK (visibility IN ('public', 'private'));

-- 기존 데이터에 기본값 설정
UPDATE projects SET visibility = 'private' WHERE visibility IS NULL;

-- visibility 필드에 NOT NULL 제약조건 추가
ALTER TABLE projects ALTER COLUMN visibility SET NOT NULL;

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Added visibility field to projects table';
END $$; 