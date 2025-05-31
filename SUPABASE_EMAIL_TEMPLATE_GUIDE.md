# 📧 Supabase 이메일 템플릿 설정 가이드 (OTP 방식)

## 🎯 **필수 변경사항**

OTP 6자리 코드 방식으로 변경하려면 Supabase 대시보드에서 이메일 템플릿을 수정해야 합니다.

## 📝 **설정 방법**

### 1. **Supabase 대시보드 접속**
1. [Supabase Dashboard](https://supabase.com/dashboard) 로그인
2. 프로젝트 선택
3. **Authentication** → **Email Templates** 메뉴 클릭

### 2. **"Confirm signup" 템플릿 수정**

기존 템플릿 (링크 방식):
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

**↓ 다음과 같이 변경 (OTP 방식):**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>브릿지메이커스 회원가입 인증</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #050a16 0%, #1a1f3a 100%); color: white; padding: 30px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .logo .accent { color: #cba967; }
        .content { padding: 40px 30px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #cba967; text-align: center; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 4px; border: 2px dashed #cba967; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .btn { display: inline-block; background-color: #cba967; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .expire-time { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">BRIDGE<span class="accent">M</span>AKERS</div>
            <p>회원가입 이메일 인증</p>
        </div>
        
        <div class="content">
            <h2>안녕하세요! 👋</h2>
            <p>브릿지메이커스 회원가입을 위한 인증 코드를 보내드립니다.</p>
            
            <p><strong>다음 6자리 코드를 입력해주세요:</strong></p>
            
            <div class="otp-code">{{ .Token }}</div>
            
            <div class="warning">
                <strong>⚠️ 중요 안내:</strong>
                <ul>
                    <li>이 코드는 <span class="expire-time">3분간만 유효</span>합니다</li>
                    <li>코드는 숫자 6자리입니다</li>
                    <li>보안을 위해 다른 사람과 공유하지 마세요</li>
                </ul>
            </div>
            
            <p><strong>입력 방법:</strong></p>
            <ol>
                <li>회원가입 창에서 인증 코드 입력 화면으로 이동</li>
                <li>위의 6자리 코드를 입력</li>
                <li>인증 완료!</li>
            </ol>
            
            <p>코드가 만료되었거나 받지 못하셨나요? 회원가입 창에서 "새 코드 받기" 버튼을 클릭해주세요.</p>
        </div>
        
        <div class="footer">
            <p>이 이메일을 요청하지 않으셨다면 무시해주세요.</p>
            <p>© 2025 브릿지메이커스. 모든 권리 보유.</p>
            <p>궁금한 점이 있으시면 고객지원팀에 문의해주세요.</p>
        </div>
    </div>
</body>
</html>
```

### 3. **이메일 제목 설정**

**Subject 필드**를 다음과 같이 설정:
```
[브릿지메이커스] 회원가입 인증 코드: {{ .Token }}
```

## 🔧 **추가 확인사항**

### 1. **Site URL 설정**
- **Authentication** → **URL Configuration**에서 Site URL이 `https://ibridgemakers.de`로 설정되어 있는지 확인

### 2. **Redirect URLs 설정**
- OTP 방식에서는 리다이렉트가 필요 없지만, 기존 설정 유지
- `https://ibridgemakers.de/**` 패턴이 허용 목록에 있는지 확인

### 3. **Email Rate Limiting**
- **Authentication** → **Rate Limits**에서 이메일 발송 제한 확인
- 기본값: 60초에 1회 (적절함)

### 4. **OTP 만료 시간**
- **Authentication** → **Providers** → **Email**에서 "Email OTP Expiration" 확인
- 권장값: 3600초 (1시간) - 현재 설정 유지

## 🎨 **템플릿 특징**

### ✅ **사용자 친화적 디자인**
- **브릿지메이커스 브랜딩**: 로고와 색상 적용
- **명확한 코드 표시**: 큰 글씨, 색상 강조, 점선 테두리
- **상세한 안내**: 단계별 입력 방법 설명
- **보안 경고**: 3분 제한시간, 공유 금지 안내

### ✅ **모바일 최적화**
- **반응형 디자인**: 모든 디바이스에서 잘 보임
- **큰 터치 영역**: 코드 복사하기 쉬움
- **읽기 쉬운 폰트**: 고대비 색상

### ✅ **개발자 친화적**
- **`{{ .Token }}` 변수**: Supabase에서 자동으로 6자리 코드 생성
- **HTML 구조**: 이메일 클라이언트 호환성 고려
- **인라인 CSS**: 이메일에서 안정적으로 작동

## 🚀 **배포 후 테스트**

템플릿 변경 후 다음을 확인:

1. **이메일 도착 확인**: 스팸함 포함 확인
2. **코드 형식 확인**: 6자리 숫자 정상 표시
3. **모바일에서 확인**: 다양한 이메일 앱에서 테스트
4. **복사 기능 확인**: 코드 선택/복사 가능 여부

## 📱 **추가 팁**

### Gmail 앱에서 최적화:
- **제목에 코드 포함**: 알림에서도 코드 확인 가능
- **명확한 시각적 구분**: 코드와 다른 텍스트 구분
- **짧고 명확한 내용**: 스크롤 없이 한 번에 확인 가능

이제 이메일 링크 클릭 없이도 모바일에서 안정적으로 회원가입할 수 있습니다! 🎉 