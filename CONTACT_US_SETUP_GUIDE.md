# 📞 Contact Us 모달 시스템 설정 가이드

## 🎯 완료된 기능들

### ✅ 1. Contact Us 모달 컴포넌트
- **위치**: `components/modal/ContactUsModal.tsx`
- **기능**: 견적문의/기타문의 처리, 파일 업로드, 폼 검증

### ✅ 2. 데이터베이스 테이블
- **파일**: `supabase_contact_inquiries_table.sql` ✅ 실행 완료
- **테이블**: `contact_inquiries`, `inquiry_files`, `notification_logs`
- **보안**: RLS 정책, 파일 크기/형식 제한

### ✅ 3. API 엔드포인트
- **문의 접수**: `/api/contact-inquiry`
- **파일 업로드**: `/api/upload-inquiry-files`  
- **이메일 발송**: `/api/send-inquiry-email`

### ✅ 4. Contact 버튼 컴포넌트
- **위치**: `components/shared/ContactButton.tsx`
- **종류**: 기본, 플로팅, 헤더용, 히어로용

---

## 🚀 사용 방법

### 1. 기본 Contact 버튼 사용

```tsx
import ContactButton from '@/components/shared/ContactButton';

// 기본 사용
<ContactButton />

// 커스텀 사용
<ContactButton 
  variant="primary" 
  size="lg" 
  text="무료 상담 받기" 
/>
```

### 2. 플로팅 버튼 (우하단 고정)

```tsx
import { FloatingContactButton } from '@/components/shared/ContactButton';

// 레이아웃에 추가
export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <FloatingContactButton />
      </body>
    </html>
  );
}
```

### 3. 헤더 네비게이션에 추가

```tsx
import { HeaderContactButton } from '@/components/shared/ContactButton';

export default function Header() {
  return (
    <header>
      <nav>
        {/* 기존 메뉴들 */}
        <HeaderContactButton />
      </nav>
    </header>
  );
}
```

### 4. 히어로 섹션에 추가

```tsx
import { HeroContactButton } from '@/components/shared/ContactButton';

export default function HeroSection() {
  return (
    <section>
      <h1>브릿지메이커스</h1>
      <p>혁신적인 디지털 솔루션</p>
      <HeroContactButton />
    </section>
  );
}
```

---

## ⚙️ 환경 설정

### 1. Supabase Storage 버킷 생성

Supabase 대시보드에서 Storage > Create Bucket:
```
버킷명: inquiry-attachments
공개 설정: false (비공개)
파일 크기 제한: 10MB
허용 MIME 타입: 
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- image/jpeg
- image/png
```

### 2. 이메일 발송 설정 (선택사항)

**.env.local** 파일에 Resend API 키 추가:
```env
RESEND_API_KEY=re_xxxxxxxxxx
```

**Resend 설정**:
1. [Resend](https://resend.com) 가입
2. API 키 생성
3. 도메인 인증 (no-reply@bridgemakers.co.kr)

### 3. 관리자 이메일 설정

**`app/api/send-inquiry-email/route.ts`** 파일에서 관리자 이메일 수정:
```tsx
// 207번째 줄 근처
to: ['admin@bridgemakers.co.kr', 'contact@bridgemakers.co.kr']
```

---

## 📊 관리자 기능

### 1. 문의 조회 쿼리

```sql
-- 최근 문의 목록
SELECT 
  id,
  inquiry_type,
  name,
  email,
  phone,
  company_name,
  status,
  created_at
FROM contact_inquiries 
ORDER BY created_at DESC 
LIMIT 20;

-- 문의 통계
SELECT * FROM inquiry_stats 
WHERE date >= CURRENT_DATE - INTERVAL '30 days';
```

### 2. 문의 상태 업데이트

```sql
-- 문의 처리 상태 변경
UPDATE contact_inquiries 
SET status = 'in_progress', 
    admin_notes = '김대리가 처리 중',
    assigned_to = '관리자_UUID'
WHERE id = '문의_UUID';
```

### 3. 첨부파일 다운로드

```sql
-- 특정 문의의 첨부파일 목록
SELECT 
  file_name,
  file_size,
  storage_path,
  created_at
FROM inquiry_files 
WHERE inquiry_id = '문의_UUID';
```

---

## 🐛 트러블슈팅

### 1. 파일 업로드 실패

**문제**: "스토리지 업로드 실패" 오류
**해결**: 
1. Supabase Storage 버킷 존재 확인
2. RLS 정책 확인
3. 파일 크기/형식 확인

### 2. 이메일 발송 실패

**문제**: 이메일이 발송되지 않음
**해결**:
1. RESEND_API_KEY 환경변수 확인
2. 도메인 인증 상태 확인
3. 관리자 이메일 주소 확인

### 3. 폼 검증 오류

**문제**: 올바른 데이터인데 검증 실패
**해결**:
1. 클라이언트/서버 검증 로직 일치 확인
2. 정규식 패턴 확인
3. 필수 필드 누락 확인

---

## 📈 향후 개선사항

### 1. 관리자 대시보드
- [ ] 문의 관리 페이지 구현
- [ ] 실시간 알림 시스템
- [ ] 응답률 통계 분석

### 2. 고객 경험 개선
- [ ] 문의 진행 상황 조회
- [ ] 자동 응답 시스템
- [ ] FAQ 연동

### 3. 성능 최적화
- [ ] 파일 업로드 진행률 표시
- [ ] 이미지 압축 기능
- [ ] CDN 연동

---

## 📝 API 응답 예시

### 성공 응답
```json
{
  "success": true,
  "message": "문의가 성공적으로 접수되었습니다.",
  "inquiryId": "uuid-here",
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

### 오류 응답
```json
{
  "error": "VALIDATION_ERROR",
  "message": "이메일 형식이 올바르지 않습니다.",
  "field": "email"
}
```

---

## 🔧 개발자 노트

1. **보안**: 모든 API는 서버사이드 검증 포함
2. **성능**: 이메일 발송은 비동기 처리로 사용자 대기시간 최소화
3. **확장성**: 새로운 문의 유형이나 필드 추가 용이
4. **모니터링**: 모든 중요 작업은 콘솔 로그 포함

---

## 🎉 완료!

Contact Us 모달 시스템이 완전히 구현되었습니다!

**테스트 해보세요:**
1. Contact 버튼 클릭
2. 견적문의/기타문의 선택
3. 정보 입력 및 파일 첨부
4. 제출 후 이메일 확인

궁금한 점이 있으면 언제든지 문의해주세요! 🚀 