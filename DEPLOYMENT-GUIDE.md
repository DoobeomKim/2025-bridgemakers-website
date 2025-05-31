# Bridgemakers 웹사이트 배포 가이드

## 📋 **배포 전 준비사항**

### 1. **환경변수 설정**

#### Vercel 환경변수
```bash
# 프로덕션 도메인 설정 (중요!)
NEXT_PUBLIC_SITE_URL=https://ibridgemakers.de

# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Vercel URL은 설정하지 않음 (자동 감지되지만 우선순위가 낮음)
# NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app
```

### 2. **Vercel 프로젝트 설정**

#### 도메인 설정 순서:
1. **Vercel 대시보드에서 프로젝트 설정**
2. **Domains 탭에서 `ibridgemakers.de` 추가**
3. **DNS 설정으로 CNAME 또는 A 레코드 구성**
4. **SSL 인증서 자동 생성 확인**

#### 환경변수 추가:
```bash
# Vercel CLI 사용법
vercel env add NEXT_PUBLIC_SITE_URL production
# 값: https://ibridgemakers.de

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 값: your-supabase-url

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
# 값: your-supabase-anon-key
```

### 3. **Supabase 설정**

#### Auth 설정 업데이트:
1. **Supabase 대시보드 → Authentication → URL Configuration**
2. **Site URL**: `https://ibridgemakers.de`
3. **Redirect URLs 추가**:
   - `https://ibridgemakers.de/ko/auth/callback`
   - `https://ibridgemakers.de/en/auth/callback`
   - `https://ibridgemakers.de/de/auth/callback`

#### 이메일 템플릿 확인:
- 회원가입 이메일의 확인 링크가 올바른 도메인으로 설정되는지 확인
- `{{ .SiteURL }}` 변수가 `https://ibridgemakers.de`로 해석되는지 확인

### 4. **DNS 설정 (도메인 제공업체에서)**

#### ibridgemakers.de DNS 레코드:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

또는

Type: A
Name: @  
Value: 76.76.19.61 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
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