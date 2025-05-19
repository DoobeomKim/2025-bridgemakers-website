-- 스토리지에 user-assets 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 모든 사용자가 자신의 프로필 이미지에 접근할 수 있는 정책
CREATE POLICY "Users can view own profile images" 
ON storage.objects FOR SELECT
USING (
  auth.uid() = (storage.foldername(name))[1]::uuid
  AND bucket_id = 'user-assets'
);

-- 프로필 이미지 폴더 경로 규칙:
-- 'profile-images/{user_id}-{timestamp}.{extension}'
-- 사용자가 자신의 프로필 이미지를 업로드할 수 있는 정책
CREATE POLICY "Users can upload their own profile images" 
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-assets'
  AND (storage.foldername(name))[1] = 'profile-images'
  AND position(auth.uid()::text in name) > 0
);

-- 사용자가 자신의 프로필 이미지를 업데이트할 수 있는 정책
CREATE POLICY "Users can update their own profile images" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-assets'
  AND position(auth.uid()::text in name) > 0
);

-- 사용자가 자신의 프로필 이미지를 삭제할 수 있는 정책
CREATE POLICY "Users can delete their own profile images" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-assets'
  AND position(auth.uid()::text in name) > 0
); 