-- 스토리지에 user-assets 버킷 생성 (공개 버킷으로 설정)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-assets', 'user-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 인증된 사용자가 버킷에 객체를 업로드할 수 있도록 허용
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-assets');

-- 인증된 사용자가 버킷의 객체를 업데이트할 수 있도록 허용
CREATE POLICY "Allow authenticated users to update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-assets');

-- 모든 사용자(인증 여부 관계없이)가 버킷의 객체를 볼 수 있도록 허용
CREATE POLICY "Allow public access to read objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-assets');

-- 인증된 사용자가 자신이 업로드한 객체를 삭제할 수 있도록 허용
CREATE POLICY "Allow authenticated users to delete own objects"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-assets' AND auth.uid() = owner); 