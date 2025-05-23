'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, User, Session } from '@supabase/auth-helpers-nextjs';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { UserRole } from '@/types/supabase';
import { getOAuthRedirectURL, getAuthCallbackURL, logEnvironmentInfo, isDevelopment } from '@/lib/utils/url';

export type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  user_level: UserRole;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
};

type AuthContextType = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (provider: 'google') => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearBrowserData: () => void;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 클라이언트 컴포넌트에서 직접 Supabase 클라이언트 생성
  const supabase = createClientComponentClient<Database>();

  // 브라우저 데이터 초기화 (쿠키, 로컬 스토리지)
  const clearBrowserData = () => {
    try {
      if (typeof window === 'undefined') return;
      
      // 로컬 스토리지 초기화
      localStorage.clear();
      
      // 쿠키 초기화
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Supabase 관련 쿠키 삭제
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
      }
      
      console.log('🧹 브라우저 인증 데이터 초기화 완료');
      
      // 세션 초기화
      supabase.auth.signOut();
      
      // 페이지 새로고침
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('❌ 브라우저 데이터 초기화 실패:', error);
    }
  };

  // Supabase 연결 테스트 함수
  const testSupabaseConnection = async () => {
    try {
      console.log('🧪 Supabase 연결 테스트 시작...');
      
      // 간단한 쿼리로 연결 테스트
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Supabase 연결 테스트 실패:', error);
        return false;
      } else {
        console.log('✅ Supabase 연결 테스트 성공');
        return true;
      }
    } catch (error) {
      console.error('❌ Supabase 연결 테스트 중 예외:', error);
      return false;
    }
  };

  // 사용자 프로필 로드
  const loadUserProfile = async (authUser: User | null) => {
    if (!authUser) {
      console.log('🚫 authUser가 null이므로 프로필 로드 중단');
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      // 이메일 인증 상태는 user_metadata.email_verified만 사용
      const isEmailVerified = authUser.user_metadata?.email_verified || false;

      console.log('🔍 사용자 프로필 로드 시작:', {
        id: authUser.id,
        email: authUser.email,
        is_email_verified: isEmailVerified,
        user_metadata: authUser.user_metadata
      });

      // 이메일 인증 상태가 없을 때만 세션 새로고침
      if (!isEmailVerified) {
        console.log('🔄 이메일 인증 상태 확인을 위한 세션 새로고침 시도');
        const { data: { session }, error: refreshError } = await supabase.auth.getSession();
        
        if (refreshError) {
          console.error('❌ 세션 새로고침 실패:', refreshError);
        } else if (session?.user) {
          const sessionEmailVerified = session.user.user_metadata?.email_verified || false;
          console.log('✅ 세션 새로고침 성공:', {
            is_email_verified: sessionEmailVerified
          });
          authUser = session.user;
        }
      } else {
        console.log('✅ 이미 이메일 인증됨');
      }

      // Supabase 연결 테스트 먼저 실행
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        console.error('❌ Supabase 연결 실패로 프로필 로드 중단');
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      console.log('📊 데이터베이스에서 프로필 조회 시작...');
      console.log('🔗 Supabase 연결 정보:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        authUserId: authUser.id
      });

      // 타임아웃이 있는 프로미스 생성
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout after 10 seconds')), 10000);
      });

      console.log('⏰ 타임아웃 10초로 데이터베이스 쿼리 실행...');

      // 타임아웃과 함께 쿼리 실행
      const { data: profile, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]).catch((err) => {
        console.error('❌ 쿼리 실행 중 에러:', err);
        throw err;
      }) as any;

      console.log('📊 데이터베이스 조회 결과:', { 
        hasData: !!profile, 
        error: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        profileData: profile ? {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          company_name: profile.company_name
        } : null
      });

      if (error) {
        console.error('❌ 사용자 프로필 로드 실패:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // 특정 에러 코드에 따른 처리
        if (error.code === 'PGRST116') {
          console.log('👤 사용자 프로필이 존재하지 않음 - 새 프로필 생성 필요');
          // 여기서 새 프로필 생성 로직을 추가할 수 있음
        }
        
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      if (!profile) {
        console.error('❌ 프로필 데이터가 없음');
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      // 프로필 정보 설정
      const userProfileData = {
        ...profile,
        email_confirmed_at: isEmailVerified ? new Date().toISOString() : null
      };

      console.log('✅ 사용자 프로필 로드 성공:', {
        id: userProfileData.id,
        email: userProfileData.email,
        first_name: userProfileData.first_name,
        last_name: userProfileData.last_name,
        company_name: userProfileData.company_name,
        profile_image_url: userProfileData.profile_image_url
      });
      
      // 프로필 정보를 localStorage에 캐싱 (1시간)
      if (typeof window !== 'undefined') {
        try {
          const cacheData = {
            data: userProfileData,
            timestamp: Date.now(),
            expiresIn: 3600000 // 1시간
          };
          localStorage.setItem('userProfile', JSON.stringify(cacheData));
          console.log('💾 프로필 캐시 저장 완료');
        } catch (cacheError) {
          console.warn('⚠️ 프로필 캐시 저장 실패:', cacheError);
        }
      }
      
      setUserProfile(userProfileData as UserProfile);
      console.log('🎯 userProfile 상태 업데이트 완료');
      
    } catch (error: any) {
      console.error('❌ 사용자 프로필 로드 중 치명적 오류:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // 네트워크 에러인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 네트워크 연결 문제로 보임');
      } else if (error.message.includes('timeout')) {
        console.error('⏰ 데이터베이스 쿼리 타임아웃');
      }
      
      setUserProfile(null);
    } finally {
      console.log('🔚 프로필 로드 과정 완료 - isLoading을 false로 설정');
      setIsLoading(false);
    }
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthProvider 초기화', { 
      initialSession: !!initialSession,
      environment: process.env.NODE_ENV
    });
    
    // 개발환경에서만 상세 환경 정보 로그
    if (isDevelopment()) {
      logEnvironmentInfo();
    }
    
    // 초기 로딩 상태 설정
    setIsLoading(true);

    // 캐시된 프로필 정보 확인 (초기 세션이 있을 때만)
    if (typeof window !== 'undefined' && initialSession?.user) {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          const { data, timestamp, expiresIn } = JSON.parse(cachedProfile);
          const isExpired = Date.now() - timestamp > expiresIn;
          
          if (!isExpired && mounted && data.id === initialSession.user.id) {
            console.log('✅ 캐시된 프로필 정보 사용:', { 
              userId: data.id, 
              email: data.email,
              environment: process.env.NODE_ENV 
            });
            setUserProfile(data as UserProfile);
            setIsLoading(false);
            return; // 캐시 사용 시 초기 로드 스킵
          } else {
            console.log('🗑️ 만료되거나 다른 사용자의 캐시 삭제');
            localStorage.removeItem('userProfile');
          }
        } catch (error) {
          console.error('❌ 캐시 파싱 오류:', error);
          localStorage.removeItem('userProfile');
        }
      }
    }
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      console.log('🔄 인증 상태 변경:', event, { 
        hasUser: !!newSession?.user,
        userId: newSession?.user?.id,
        environment: process.env.NODE_ENV,
        origin: typeof window !== 'undefined' ? window.location.origin : 'server'
      });
      
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // 로그아웃 처리
        if (!newSession?.user || event === 'SIGNED_OUT') {
          console.log('🚪 로그아웃 상태 처리');
          setUserProfile(null);
          setIsLoading(false);
          // 로그아웃 시 캐시 삭제
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userProfile');
          }
          return;
        }
        
        // 로그인 관련 이벤트에서 프로필 로드
        if (['SIGNED_IN', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
          console.log('📥 프로필 새로 로드:', event);
          await loadUserProfile(newSession.user);
        }
      }
    });

    // 초기 사용자 프로필 로드 (캐시가 없는 경우만)
    if (initialSession?.user && mounted) {
      console.log('🔄 초기 프로필 로드 시작');
      loadUserProfile(initialSession.user);
    } else if (!initialSession?.user) {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialSession, supabase]);

  // OAuth 로그인
  const signIn = async (provider: 'google') => {
    try {
      // 환경 정보 로그 (개발환경에서만)
      if (isDevelopment()) {
        logEnvironmentInfo();
      }
      
      const redirectURL = getOAuthRedirectURL();
      console.log('🔄 OAuth 로그인 시도:', { 
        provider, 
        redirectTo: redirectURL,
        environment: process.env.NODE_ENV 
      });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
        },
      });

      if (error) {
        console.error('❌ 로그인 실패:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ signIn 오류:', error);
      throw error;
    }
  };

  // 이메일/비밀번호 로그인
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔄 이메일 로그인 시도:', { email });
      
      // 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ 이메일 로그인 실패:', error);
        throw error;
      }

      // 이메일 인증 여부 확인 (auth.users 테이블)
      if (!data.user.email_confirmed_at) {
        console.error('❌ 이메일 미인증:', {
          email: data.user.email,
          id: data.user.id,
          created_at: data.user.created_at
        });
        
        // 로그아웃 처리
        await supabase.auth.signOut();
        throw new Error('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.');
      }

      // 사용자 프로필 로드
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ 프로필 로드 실패:', profileError);
        await supabase.auth.signOut();
        throw new Error('사용자 프로필을 찾을 수 없습니다.');
      }

      console.log('✅ 이메일 로그인 성공:', {
        email: data.user.email,
        id: data.user.id,
        created_at: data.user.created_at,
        email_confirmed_at: data.user.email_confirmed_at
      });

      setUser(data.user);
      setSession(data.session);
      setUserProfile(profile as UserProfile);
      
    } catch (error: any) {
      console.error('❌ 로그인 처리 중 오류:', error);
      throw error;
    }
  };

  // 이메일/비밀번호 회원가입
  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('🔄 회원가입 시도:', { email, firstName, lastName });
      
      const callbackURL = getAuthCallbackURL('ko');
      console.log('📧 회원가입 콜백 URL:', callbackURL);
      
      // 1. auth.users 테이블에 사용자 생성
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: callbackURL,
        },
      });

      if (error) {
        console.error('❌ 회원가입 실패:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('사용자 생성 실패');
      }

      // 임시 데이터를 로컬 스토리지에 저장
      localStorage.setItem('pendingUserData', JSON.stringify({
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
      }));

      console.log('✅ 회원가입 성공 - 이메일 인증 대기 중:', {
        id: data.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName
      });

    } catch (error) {
      console.error('❌ signUpWithEmail 오류:', error);
      throw error;
    }
  };

  // 이메일 인증 재전송
  const resendVerificationEmail = async (email: string) => {
    try {
      console.log('🔄 이메일 인증 재전송:', { email });
      
      const callbackURL = getAuthCallbackURL('ko');
      console.log('📧 재전송 콜백 URL:', callbackURL);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: callbackURL,
        },
      });

      if (error) {
        console.error('❌ 이메일 재전송 실패:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ resendVerificationEmail 오류:', error);
      throw error;
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      const callbackURL = getAuthCallbackURL('ko') + '?reset=true';
      console.log('🔄 비밀번호 재설정 이메일 전송:', { email, callbackURL });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackURL,
      });

      if (error) {
        console.error('❌ 비밀번호 재설정 이메일 전송 실패:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ resetPassword 오류:', error);
      throw error;
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      console.log('🔄 로그아웃 시도...');
      
      // 1. 즉시 상태 초기화 (UI 업데이트 빠르게)
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsLoading(false);
      
      // 2. 로컬 스토리지 및 캐시 즉시 초기화
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('pendingUserData');
        
        // 모든 Supabase 관련 localStorage 키 제거
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase') || key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }

      // 3. 쿠키 초기화 (개선된 버전)
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const isSecure = window.location.protocol === 'https:';
        const domain = window.location.hostname;
        
        console.log('🍪 쿠키 삭제 환경:', { isSecure, domain, protocol: window.location.protocol });
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          if (name.includes('supabase') || name.includes('sb-')) {
            // 기본 경로로 삭제
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            
            // 도메인별 삭제
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
            
            // HTTPS 환경에서 secure 쿠키 삭제
            if (isSecure) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;secure`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain};secure`;
            }
            
            // 서브도메인까지 고려한 삭제
            if (domain.includes('.')) {
              const rootDomain = domain.split('.').slice(-2).join('.');
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain}`;
              if (isSecure) {
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${rootDomain};secure`;
              }
            }
            
            console.log('🍪 쿠키 삭제:', name);
          }
        }
      }

      // 4. Supabase 세션 종료 (백그라운드에서)
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('⚠️ Supabase 로그아웃 경고:', error);
          // 에러가 발생해도 로그아웃 프로세스는 계속 진행
        }
      } catch (error) {
        console.warn('⚠️ Supabase 로그아웃 처리 중 오류:', error);
        // 에러가 발생해도 로그아웃 프로세스는 계속 진행
      }

      console.log('✅ 로그아웃 상태 초기화 완료');
    } catch (error) {
      console.error('❌ signOut 오류:', error);
      // 에러가 발생해도 상태는 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setIsLoading(false);
      throw error;
    }
  };

  // 프로필 새로고침 함수
  const refreshUserProfile = async () => {
    try {
      if (!user) {
        console.warn('⚠️ 사용자가 로그인되지 않아 프로필을 새로고침할 수 없습니다.');
        return;
      }

      console.log('🔄 프로필 새로고침 시작...');
      
      // 캐시 삭제
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        console.log('🗑️ 프로필 캐시 삭제');
      }
      
      // 새로고침 시작
      setIsLoading(true);
      
      // 프로필 새로 로드
      await loadUserProfile(user);
      
      console.log('✅ 프로필 새로고침 완료');
    } catch (error) {
      console.error('❌ 사용자 프로필 새로고침 중 오류:', error);
    }
  };

  const value = {
    supabase,
    user,
    userProfile,
    session,
    isLoading,
    signIn,
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    resetPassword,
    signOut,
    clearBrowserData,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 