-- Contact Us 모달을 위한 테이블 생성 SQL
-- 브릿지메이커스 웹사이트 문의 시스템

-- 1. 문의 메인 테이블 생성
CREATE TABLE contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 문의 유형
  inquiry_type VARCHAR(20) NOT NULL CHECK (inquiry_type IN ('quote', 'general')),
  
  -- 고객 정보
  client_type VARCHAR(20) NOT NULL CHECK (client_type IN ('individual', 'company')),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  company_name VARCHAR(100), -- 법인 선택시만 필수
  
  -- 견적문의 전용 필드들
  selected_fields TEXT[], -- 선택된 분야들 배열 (영상제작, 웹앱제작, SNS컨텐츠)
  budget VARCHAR(50), -- 예산 범위
  project_date DATE, -- 프로젝트 희망 일정
  
  -- 문의 내용
  content TEXT NOT NULL,
  
  -- 상태 관리
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  admin_notes TEXT, -- 관리자 메모
  
  -- 개인정보 동의
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  
  -- 인덱스를 위한 컬럼들
  processed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID -- 담당자 ID (추후 admin 테이블과 연결)
);

-- 2. 첨부파일 테이블 생성 (별도 테이블로 분리)
CREATE TABLE inquiry_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES contact_inquiries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 파일 정보
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL, -- 바이트 단위
  file_type VARCHAR(100) NOT NULL, -- MIME type
  file_extension VARCHAR(10) NOT NULL,
  
  -- Supabase Storage 경로
  storage_path TEXT NOT NULL, -- storage에서의 파일 경로
  
  -- 메타데이터
  uploaded_by_ip INET, -- 업로드한 IP (보안/추적용)
  is_processed BOOLEAN DEFAULT false -- 파일 처리 완료 여부
);

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_inquiry_type ON contact_inquiries(inquiry_type);
CREATE INDEX idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX idx_inquiry_files_inquiry_id ON inquiry_files(inquiry_id);

-- 4. Updated_at 자동 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_inquiries_updated_at 
    BEFORE UPDATE ON contact_inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) 정책 설정
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_files ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 데이터에 접근 가능 (추후 admin 역할 테이블과 연동)
CREATE POLICY "관리자는 모든 문의를 볼 수 있음" ON contact_inquiries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('admin@bridgemakers.co.kr') -- 관리자 이메일 목록
        )
    );

CREATE POLICY "관리자는 모든 파일을 볼 수 있음" ON inquiry_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('admin@bridgemakers.co.kr') -- 관리자 이메일 목록
        )
    );

-- 익명 사용자는 INSERT만 가능 (문의 접수만)
CREATE POLICY "익명 사용자 문의 접수 가능" ON contact_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "익명 사용자 파일 업로드 가능" ON inquiry_files
    FOR INSERT WITH CHECK (true);

-- 6. 문의 통계를 위한 뷰 생성
CREATE VIEW inquiry_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    inquiry_type,
    status,
    COUNT(*) as count
FROM contact_inquiries
GROUP BY DATE_TRUNC('day', created_at), inquiry_type, status
ORDER BY date DESC;

-- 7. 파일 크기 제한을 위한 체크 함수
CREATE OR REPLACE FUNCTION check_file_size()
RETURNS TRIGGER AS $$
BEGIN
    -- 파일 크기가 10MB를 초과하는지 확인
    IF NEW.file_size > 10485760 THEN -- 10MB = 10 * 1024 * 1024 bytes
        RAISE EXCEPTION '파일 크기는 10MB를 초과할 수 없습니다. 현재 크기: % bytes', NEW.file_size;
    END IF;
    
    -- 허용된 파일 확장자인지 확인
    IF LOWER(NEW.file_extension) NOT IN ('.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png') THEN
        RAISE EXCEPTION '허용되지 않는 파일 형식입니다: %', NEW.file_extension;
    END IF;
    
    -- 문의당 최대 5개 파일 제한 확인
    IF (SELECT COUNT(*) FROM inquiry_files WHERE inquiry_id = NEW.inquiry_id) >= 5 THEN
        RAISE EXCEPTION '문의당 최대 5개의 파일만 첨부할 수 있습니다.';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER check_file_constraints
    BEFORE INSERT ON inquiry_files
    FOR EACH ROW EXECUTE FUNCTION check_file_size();

-- 8. 문의 접수 알림을 위한 함수 (추후 webhook 연동용)
CREATE OR REPLACE FUNCTION notify_new_inquiry()
RETURNS TRIGGER AS $$
BEGIN
    -- 새 문의가 접수되면 알림 로그 생성
    INSERT INTO notification_logs (type, message, data)
    VALUES (
        'new_inquiry',
        '새로운 ' || (CASE WHEN NEW.inquiry_type = 'quote' THEN '견적문의' ELSE '기타문의' END) || '가 접수되었습니다.',
        json_build_object(
            'inquiry_id', NEW.id,
            'name', NEW.name,
            'email', NEW.email,
            'inquiry_type', NEW.inquiry_type
        )
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 알림 로그 테이블 생성 (선택사항)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    processed BOOLEAN DEFAULT false
);

CREATE TRIGGER notify_inquiry_trigger
    AFTER INSERT ON contact_inquiries
    FOR EACH ROW EXECUTE FUNCTION notify_new_inquiry();

-- 9. 샘플 데이터 삽입 (테스트용 - 선택사항)
-- INSERT INTO contact_inquiries (
--     inquiry_type, client_type, name, email, phone, company_name,
--     selected_fields, budget, content, privacy_consent
-- ) VALUES (
--     'quote', 'company', '김개발', 'test@example.com', '010-1234-5678', '테스트회사',
--     ARRAY['웹앱제작', 'SNS컨텐츠'], '1000-5000', '테스트 문의입니다.', true
-- );

-- 완료 메시지
SELECT '✅ Contact Us 테이블이 성공적으로 생성되었습니다!' as status; 