# 🌐 ibridgemakers.de 도메인 설정 가이드

## 📋 **문제 상황**

회원가입 인증 이메일의 confirm 버튼 링크가 `2025-bridgemakers-website.vercel.app` 도메인으로 생성되어, 실제 도메인인 `ibridgemakers.de`로 연결되지 않는 문제입니다.

## 🔧 **해결 방법**

### 1. **Vercel 환경변수 설정**

Vercel 대시보드에서 다음 환경변수를 설정하세요:

```bash
# 프로덕션 환경변수 (Production)
NEXT_PUBLIC_SITE_URL=https://ibridgemakers.de

# Supabase 연결 정보
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### Vercel CLI로 설정하기:
```bash
# Vercel CLI 설치 (필요한 경우)
npm i -g vercel

# 프로젝트 연결
vercel link

# 환경변수 추가
vercel env add NEXT_PUBLIC_SITE_URL production
# 값 입력: https://ibridgemakers.de

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 값 입력: your-supabase-url

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 값 입력: your-supabase-anon-key
```

### 2. **Supabase 인증 설정**

Supabase 대시보드에서 다음을 설정하세요:

#### Authentication → URL Configuration:
```
Site URL: https://ibridgemakers.de

Redirect URLs (줄바꿈으로 구분하여 모두 추가):
https://ibridgemakers.de/ko/auth/callback
https://ibridgemakers.de/en/auth/callback
https://ibridgemakers.de/de/auth/callback
https://ibridgemakers.de/auth/callback
https://2025-bridgemakers-website.vercel.app/ko/auth/callback (개발/테스트용)
http://localhost:3000/ko/auth/callback (로컬 개발용)
```

### 3. **DNS 설정 확인**

도메인 제공업체(예: Namecheap, GoDaddy)에서 DNS 설정을 확인하세요:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 4. **Vercel 도메인 연결**

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. "Add" 버튼 클릭
3. `ibridgemakers.de` 입력
4. `www.ibridgemakers.de`도 추가 (선택사항)
5. SSL 인증서 자동 생성 확인

### 5. **배포 및 확인**

```bash
# 코드 변경사항 배포
git add .
git commit -m "Fix email auth domain configuration"
git push origin main

# 또는 Vercel CLI로 직접 배포
vercel --prod
```

## 🧪 **테스트 방법**

### 1. **환경변수 확인**
브라우저 개발자 도구 콘솔에서 다음 함수를 실행하세요:

```javascript
// 환경 정보 디버깅
import { debugEnvironment } from '/lib/utils/debug';
debugEnvironment();
```

### 2. **회원가입 테스트**
1. `https://ibridgemakers.de`에서 회원가입 시도
2. 브라우저 콘솔에서 생성된 콜백 URL 확인
3. 이메일에서 받은 confirm 링크가 `ibridgemakers.de`로 시작하는지 확인

### 3. **예상 결과**
✅ 정상: `https://ibridgemakers.de/ko/auth/callback?token=...`
❌ 문제: `https://2025-bridgemakers-website.vercel.app/ko/auth/callback?token=...`

## 🚨 **트러블슈팅**

### 문제 1: 환경변수가 적용되지 않음
```bash
# 해결: 환경변수 재설정 후 재배포
vercel env rm NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# 값: https://ibridgemakers.de
vercel --prod
```

### 문제 2: DNS 설정이 반영되지 않음
- DNS 변경사항은 최대 48시간 소요될 수 있습니다
- `nslookup ibridgemakers.de` 명령어로 DNS 상태 확인

### 문제 3: SSL 인증서 오류
- Vercel에서 SSL 인증서가 자동 생성되는지 확인
- 도메인 연결 후 몇 분 대기

### 문제 4: 여전히 Vercel URL 사용
1. 브라우저 캐시 삭제
2. 시크릿/비공개 브라우징 모드에서 테스트
3. 다른 디바이스에서 테스트

## 📞 **지원**

문제가 지속되면 다음 정보를 포함하여 개발팀에 문의하세요:

1. 브라우저 콘솔의 환경 디버깅 결과
2. 받은 이메일의 confirm 링크 URL
3. Vercel 환경변수 스크린샷 (민감정보 제외)
4. Supabase Auth 설정 스크린샷

---

**중요**: 이 설정 변경 후 기존 사용자들이 받은 이메일의 오래된 링크는 여전히 작동하지 않을 수 있습니다. 새로 가입하는 사용자부터 올바른 도메인이 적용됩니다. 