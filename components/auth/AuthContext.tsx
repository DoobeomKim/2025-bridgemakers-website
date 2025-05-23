'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, User, Session } from '@supabase/auth-helpers-nextjs';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { UserRole } from '@/types/supabase';

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

  // 사용자 프로필 로드
  const loadUserProfile = async (authUser: User | null) => {
    if (!authUser) {
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

      // users 테이블에서 프로필 정보 가져오기
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('❌ 사용자 프로필 로드 실패:', error);
        throw error;
      }

      // 프로필 정보 설정
      const userProfileData = {
        ...profile,
        email_confirmed_at: isEmailVerified ? new Date().toISOString() : null
      };

      console.log('✅ 사용자 프로필 로드 성공:', userProfileData);
      
      // 프로필 정보를 localStorage에 캐싱 (1시간)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userProfile', JSON.stringify({
          data: userProfileData,
          timestamp: Date.now(),
          expiresIn: 3600000 // 1시간
        }));
      }
      
      setUserProfile(userProfileData as UserProfile);
    } catch (error) {
      console.error('❌ 사용자 프로필 로드 중 오류:', error);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthProvider 초기화', { initialSession });
    
    // 초기 로딩 상태 설정
    setIsLoading(true);

    // 캐시된 프로필 정보 확인
    if (typeof window !== 'undefined') {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        const { data, timestamp, expiresIn } = JSON.parse(cachedProfile);
        const isExpired = Date.now() - timestamp > expiresIn;
        
        if (!isExpired && mounted) {
          console.log('✅ 캐시된 프로필 정보 사용');
          setUserProfile(data as UserProfile);
          setIsLoading(false);
        }
      }
    }
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      console.log('🔄 인증 상태 변경:', event);
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // 특정 이벤트에서만 프로필 동기화
        if (['SIGNED_IN', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event) && newSession?.user) {
          await loadUserProfile(newSession.user);
        } else if (!newSession?.user) {
          setUserProfile(null);
          setIsLoading(false);
          // 로그아웃 시 캐시 삭제
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userProfile');
          }
        }
      }
    });

    // 초기 사용자 프로필 로드 (캐시가 없거나 만료된 경우)
    if (initialSession?.user) {
      loadUserProfile(initialSession.user);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialSession, supabase]);

  // OAuth 로그인
  const signIn = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
      
      // 1. auth.users 테이블에 사용자 생성
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/ko/auth/callback`,
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
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/ko/auth/callback`,
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/ko/auth/callback?reset=true`,
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
      
      // 1. Supabase 세션 종료
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase 로그아웃 실패:', error);
        throw error;
      }

      // 2. 상태 초기화
      setUser(null);
      setSession(null);
      setUserProfile(null);

      // 3. 로컬 스토리지 초기화
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('supabase.auth.token');
      }

      // 4. 쿠키 초기화
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
      }

      console.log('✅ 로그아웃 성공');
    } catch (error) {
      console.error('❌ signOut 오류:', error);
      throw error;
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 