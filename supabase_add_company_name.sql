-- users 테이블에 company_name 필드 추가
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 기존 handle_new_user 함수 업데이트
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, company_name, user_level)
  VALUES (NEW.id, NEW.email, '', '', NULL, 'basic')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 