# Bridge Makers 웹사이트

Next.js 기반의 웹사이트로, Clerk 인증과 Supabase 데이터베이스를 활용한 사용자 관리 시스템이 구현되어 있습니다.

## 주요 기능

- Clerk를 이용한 사용자 인증 (로그인, 회원가입)
- Supabase 데이터베이스 연동
- 사용자 프로필 관리
- 대시보드 UI

## 시작하기

### 필수 환경 변수

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```
# Supabase 환경 변수
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk 환경 변수
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Supabase 설정

1. Supabase 프로젝트를 생성하세요.
2. 다음 SQL을 실행하여 필요한 테이블을 생성하세요:

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row-Level Security(RLS) 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 - 인증된 사용자만 본인 데이터 접근 가능
CREATE POLICY "Users can view and update their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
```

### Clerk 설정

1. Clerk 프로젝트를 생성하세요.
2. 이메일, 소셜 로그인 등 원하는 인증 방식을 설정하세요.
3. 환경 변수를 복사하여 `.env.local`에 붙여넣으세요.

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)를 열어 결과를 확인하세요.

## 프로젝트 구조

- `/app` - 애플리케이션 라우트 및 페이지
- `/lib` - 유틸리티 및 설정 파일
- `/public` - 정적 파일 (이미지, 아이콘 등)

## 기술 스택

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Clerk (인증)
- Supabase (데이터베이스)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 개발 가이드라인

- [Next.js 개발 가이드라인](./docs/next-js-guidelines.md) - Next.js 앱 개발 시 준수해야 할 규칙 및 패턴
