# Supabase 스토리지 버킷 설정 가이드

이 문서는 Supabase 스토리지를 설정하는 방법을 설명합니다. "user-assets" 버킷을 생성하고 프로필 이미지 저장을 위한 폴더 구조를 설정하는 과정을 안내합니다.

## 1. 환경 설정

다음 환경 변수를 설정해야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

이 값들은 Supabase 대시보드의 Project Settings > API 페이지에서 확인할 수 있습니다.

## 2. 설정 방법

두 가지 방법으로 설정할 수 있습니다:

### 방법 1: 자동 설정 스크립트 실행

제공된 스크립트를 사용하여 자동으로 설정할 수 있습니다.

#### 1-A: .env 파일 사용

1. 환경 변수 파일 생성:
   ```
   touch .env
   ```

2. `.env` 파일에 다음 내용을 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. 스크립트 실행:
   ```
   npm run setup-storage
   ```

#### 1-B: 커맨드 라인 인자 사용

환경 변수를 직접 파일에 저장하지 않고 커맨드 라인으로 전달할 수 있습니다:

```
node create_bucket.js --url=https://your-project-url.supabase.co --key=your-service-role-key
```

### 방법 2: Supabase UI를 통한 수동 설정

Supabase 대시보드를 통해 직접 설정할 수 있습니다.

1. Supabase 프로젝트 대시보드에 로그인합니다.
2. 왼쪽 메뉴에서 "Storage" 항목을 클릭합니다.
3. "New Bucket" 버튼을 클릭합니다.
4. 버킷 이름에 `user-assets`를 입력합니다.
5. "Public bucket" 옵션을 체크합니다.
6. "Create bucket" 버튼을 클릭합니다.
7. 생성된 `user-assets` 버킷을 클릭합니다.
8. "Create folder" 버튼을 클릭합니다.
9. 폴더 이름을 정확히 `profile-images`로 지정하고 생성합니다.

## 3. 접근 정책(Access Policies) 설정

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

## 4. SQL 스크립트를 통한 설정

Supabase SQL 편집기에서 `supabase_storage_setup.sql` 스크립트를 실행하여 모든 정책을 한 번에 설정할 수 있습니다.

## 문제 해결

버킷 생성 후에도 "user-assets 버킷을 찾을 수 없습니다" 오류가 계속 발생하면:

1. Supabase 대시보드에서 Storage 섹션으로 이동하여 `user-assets` 버킷이 정상적으로 생성되었는지 확인합니다.
2. Supabase 프로젝트를 재시작합니다 (Settings > Project Settings > General)
3. 앱을 다시 시작합니다 (브라우저 캐시 삭제 후)
4. 여전히 문제가 지속되면 Supabase 지원팀에 문의하세요. 