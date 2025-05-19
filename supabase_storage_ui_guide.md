# Supabase UI를 통한 Storage 버킷 생성 가이드

SQL 스크립트를 실행하는 대신 Supabase UI를 통해 더 쉽게 Storage 버킷을 생성할 수 있습니다.

## 버킷 생성 단계

1. Supabase 프로젝트 대시보드에 로그인합니다.
2. 왼쪽 메뉴에서 "Storage" 항목을 클릭합니다.
3. "New Bucket" 버튼을 클릭합니다.
4. 버킷 이름에 `user-assets`를 입력합니다.
5. "Public bucket" 옵션을 체크합니다.
   - 이 옵션을 선택하면 업로드된 파일에 인증 없이 공개적으로 접근할 수 있습니다.
   - 프로필 이미지는 일반적으로 공개적으로 액세스 가능해야 하므로 이 옵션을 선택하는 것이 좋습니다.
6. "Create bucket" 버튼을 클릭합니다.

## 프로필 이미지 폴더 생성 (필수)

1. 생성된 `user-assets` 버킷을 클릭합니다.
2. "Create folder" 버튼을 클릭합니다.
3. 폴더 이름을 정확히 `profile-images`로 지정하고 생성합니다.
   - 이 이름은 대소문자를 구분하므로 정확히 입력해야 합니다.
   - 모든 프로필 이미지는 이 폴더에 저장됩니다.

## 파일 명명 규칙

우리 애플리케이션은 다음과 같은 명명 규칙을 사용합니다:

- 형식: `profile-images/{userId}-{timestamp}.{extension}`
- 예시: `profile-images/5a8d2d1d-b517-4a78-bb07-11ea69ce44bc-1747086268255.jpg`
- 구성 요소:
  - `profile-images/`: 모든 프로필 이미지가 저장되는 폴더
  - `{userId}`: 사용자의 고유 식별자(UUID)
  - `-`: 구분자
  - `{timestamp}`: 밀리초 단위의 타임스탬프 (업로드 시점, 중복 방지용)
  - `.{extension}`: 파일 확장자 (.jpg, .png 등)

## 접근 정책(Access Policies) 설정

버킷을 생성한 후 적절한 접근 정책을 설정해야 합니다:

1. 생성된 `user-assets` 버킷을 클릭합니다.
2. "Policies" 탭을 클릭합니다.
3. "Add policy" 버튼을 클릭합니다.
4. 다음 정책들을 추가합니다:

### 사용자 프로필 이미지 업로드 허용
- 정책 이름: "사용자 프로필 이미지 업로드 허용"
- 대상: "authenticated users"
- 작업: "INSERT"
- 조건: 
  ```sql
  bucket_id = 'user-assets' AND 
  STARTS_WITH(name, 'profile-images/') AND 
  position(auth.uid()::text in name) > 0
  ```

### 프로필 이미지 공개 접근 허용
- 정책 이름: "프로필 이미지 공개 접근 허용"
- 대상: "public (anonymous users)"
- 작업: "SELECT"
- 조건:
  ```sql
  bucket_id = 'user-assets' AND 
  STARTS_WITH(name, 'profile-images/')
  ```

## 주의사항

- 공개 버킷을 사용할 경우 업로드된 모든 파일은 인터넷에 공개됩니다.
- 민감한 정보나 개인 정보가 포함된 파일은 공개 버킷에 업로드하지 마세요.
- 이미지 처리 시 20MB 이하의 파일만 업로드하도록 제한하는 것이 좋습니다.
- 업로드된 파일의 보안 수준을 높이고 싶다면 비공개 버킷을 사용하고 적절한 RLS 정책을 설정하세요.

## 문제 해결

### "Bucket not found" 오류 해결

"user-assets 버킷을 찾을 수 없습니다. 버킷 생성이 필요합니다." 오류가 발생하는 경우:

1. **버킷 존재 확인**: Supabase 대시보드의 Storage 섹션에서 `user-assets` 버킷이 올바르게 생성되었는지 확인하세요.

2. **캐시 초기화**:
   - 브라우저 캐시를 삭제하고 페이지를 새로고침합니다.
   - 애플리케이션을 다시 시작합니다.

3. **가시성 및 인덱싱 지연**:
   - Supabase는 새로 생성된 리소스가 API를 통해 완전히 가시화되기 전에 짧은 지연이 있을 수 있습니다.
   - 몇 분 기다린 후 다시 시도해 보세요.

4. **스크립트를 사용한 자동 생성**:
   - 제공된 `create_bucket.js` 스크립트를 사용하여 버킷을 자동으로 생성하세요.
   - 실행 방법: `npm run setup-storage` 또는 `node create_bucket.js --url=your-url --key=your-key`

5. **Supabase 재시작**:
   - Supabase 대시보드에서 프로젝트를 재시작하세요 (Settings > Project Settings > General)

6. **정책 확인**:
   - 모든 필요한 접근 정책이 올바르게 설정되었는지 확인하세요.
   - 누락된 정책이 있으면 `supabase_storage_setup.sql` 스크립트를 실행하세요.

이러한 단계를 수행한 후에도 문제가 지속되면 Supabase 지원팀에 문의하세요. 