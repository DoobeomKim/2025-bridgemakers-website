-- users 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  profile_image_url TEXT,
  user_level TEXT NOT NULL DEFAULT 'basic' CHECK (user_level IN ('basic', 'premium', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 자동으로 updated_at 값을 업데이트하는 트리거 추가
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS(Row Level Security) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 테이블의 모든 행에 대한 public 접근 권한 제한
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- 사용자가 자신의 프로필을 업데이트할 수 있도록 허용
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 새 사용자가 자신의 프로필을 생성할 수 있도록 허용
CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 관리자가 모든 사용자 프로필을 볼 수 있도록 허용
CREATE POLICY "Admin users can view all profiles" 
ON public.users FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

-- 관리자가 모든 사용자 프로필을 업데이트할 수 있도록 허용
CREATE POLICY "Admin users can update all profiles" 
ON public.users FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM public.users WHERE user_level = 'admin'
  )
);

-- 사용자가 가입할 때 users 테이블에 자동으로 추가되도록 하는 함수와 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, user_level)
  VALUES (NEW.id, NEW.email, '', '', 'basic')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 