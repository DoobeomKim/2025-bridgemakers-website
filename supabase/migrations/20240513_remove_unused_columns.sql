-- 프로젝트 테이블에서 불필요한 컬럼 제거
ALTER TABLE projects DROP COLUMN IF EXISTS is_featured;
ALTER TABLE projects DROP COLUMN IF EXISTS status;
ALTER TABLE projects DROP COLUMN IF EXISTS service;
 
-- 마이그레이션 완료 로그
DO $$
BEGIN
    RAISE NOTICE 'Migration completed: Removed is_featured, status, and service columns from projects table';
END $$; 