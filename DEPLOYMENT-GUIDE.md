# 배포환경 인증 설정 가이드

## 1. 환경변수 설정

### 프로덕션 환경변수 (.env.production 또는 배포 플랫폼에서 설정)

```env
# 기본 Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 프로덕션 도메인 설정 (중요!)
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# Vercel 배포 시 자동 설정됨
# NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app

# 환경 구분
NODE_ENV=production
```

## 2. Supabase URL 설정

### Supabase 대시보드에서 설정해야 할 항목들:

1. **Authentication > URL Configuration**에서:
   - Site URL: `https://your-production-domain.com`
   - Redirect URLs에 추가:
     ```
     https://your-production-domain.com/auth/callback
     https://your-production-domain.com/ko/auth/callback
     https://your-production-domain.com/**
     http://localhost:3000/**  (개발용)
     ```

2. **OAuth Provider 설정** (Google 등):
   - Authorized redirect URIs에 추가:
     ```
     https://your-project.supabase.co/auth/v1/callback
     https://your-production-domain.com/auth/callback
     ```

## 3. 배포 플랫폼별 설정

### Vercel 배포 시:
```bash
# 환경변수 설정
vercel env add NEXT_PUBLIC_SITE_URL production
# 값: https://your-domain.com

# 또는 Vercel 대시보드에서 Environment Variables 섹션에 추가
```

### Netlify 배포 시:
```bash
# netlify.toml 파일에 환경변수 추가
[build.environment]
  NEXT_PUBLIC_SITE_URL = "https://your-domain.com"
```

## 4. 일반적인 문제 해결

### 문제 1: 로그인 후 프로필이 표시되지 않음
**원인**: OAuth redirect URL 불일치
**해결**: Supabase URL Configuration에서 정확한 도메인 설정

### 문제 2: 쿠키 문제 (HTTPS vs HTTP)
**원인**: 배포환경에서 secure 쿠키 설정 차이
**해결**: 개선된 쿠키 삭제 로직이 적용됨 (자동 해결)

### 문제 3: 환경변수 불일치
**원인**: 개발환경과 배포환경의 URL 차이
**해결**: 동적 URL 생성 함수 사용 (자동 해결)

## 5. 디버깅 방법

### 개발환경에서 로그 확인:
```javascript
// 브라우저 콘솔에서 확인할 로그들:
// 🌍 환경 정보: {...}
// 🔄 OAuth 로그인 시도: {...}
// 🔄 인증 상태 변경: {...}
```

### 배포환경에서 문제 발생 시:
1. 브라우저 개발자 도구 > Console 탭에서 오류 확인
2. Network 탭에서 API 요청/응답 확인
3. Application 탭에서 쿠키/로컬스토리지 상태 확인

## 6. 체크리스트

- [ ] NEXT_PUBLIC_SITE_URL 환경변수 설정됨
- [ ] Supabase Site URL 설정됨
- [ ] Supabase Redirect URLs 설정됨
- [ ] OAuth Provider Authorized URIs 설정됨
- [ ] 배포 후 실제 도메인에서 로그인 테스트
- [ ] 브라우저 콘솔에서 오류 없는지 확인

## 7. 추가 개선사항

현재 적용된 개선사항들:
- ✅ 환경별 동적 URL 생성
- ✅ 개선된 쿠키 삭제 로직 (HTTPS 지원)
- ✅ 상세한 디버깅 로그
- ✅ 캐시 무효화 및 프로필 새로고침
- ✅ 에러 복구 메커니즘 