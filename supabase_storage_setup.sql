-- 스토리지에 user-assets 버킷 생성 (공개 버킷으로 설정)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 인증된 사용자가 프로필 이미지를 업로드할 수 있도록 허용
-- 파일 형식: profile-images/{userId}-{timestamp}.{extension}
CREATE POLICY "사용자 프로필 이미지 업로드 허용"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' AND
  STARTS_WITH(name, 'profile-images/') AND
  position(auth.uid()::text in name) > 0
);

-- 인증된 사용자가 자신의 프로필 이미지를 업데이트할 수 있도록 허용
CREATE POLICY "사용자 프로필 이미지 업데이트 허용"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-assets' AND
  STARTS_WITH(name, 'profile-images/') AND
  position(auth.uid()::text in name) > 0
);

-- 모든 사용자에게 프로필 이미지 열람 허용 (공개 액세스)
CREATE POLICY "프로필 이미지 공개 접근 허용"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'user-assets' AND
  STARTS_WITH(name, 'profile-images/')
);

-- 인증된 사용자가 자신의 프로필 이미지를 삭제할 수 있도록 허용
CREATE POLICY "사용자 프로필 이미지 삭제 허용"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-assets' AND
  STARTS_WITH(name, 'profile-images/') AND
  position(auth.uid()::text in name) > 0
);

-- 파일 확장자 검증 함수 추가 (선택사항)
CREATE OR REPLACE FUNCTION is_valid_image_extension(filename TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  extension TEXT;
BEGIN
  extension := lower(substring(filename from '\.([^\.]+)$'));
  RETURN extension IN ('.jpg', '.jpeg', '.png', '.gif', '.webp');
END;
$$ LANGUAGE plpgsql;

-- 이미지 파일만 업로드 허용하는 정책 (선택사항)
CREATE POLICY "이미지 파일만 업로드 허용"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' AND
  STARTS_WITH(name, 'profile-images/') AND
  is_valid_image_extension(name)
); 