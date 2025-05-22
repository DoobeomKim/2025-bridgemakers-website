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
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 사용자 프로필 로드 시작:', user.id);
        
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            email,
            first_name,
            last_name,
            profile_image_url,
            user_level,
            company_name,
            created_at,
            updated_at
          `)
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('🔍 사용자 프로필 조회 실패:', error);
          // 사용자 프로필이 없으면 생성
          await createUserProfile(user);
        } else {
          console.log('✅ 사용자 프로필 로드 성공:', {
            id: data.id,
            email: data.email,
            user_level: data.user_level,
            profile_image_url: data.profile_image_url ? '있음' : '없음',
            company_name: data.company_name || '없음',
            created_at: data.created_at,
            fields: Object.keys(data)
          });
          setUserProfile(data as UserProfile);
        }
      } catch (error) {
        console.error('❌ 프로필 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user, supabase]);

  // 새 사용자 프로필 생성
  const createUserProfile = async (user: User) => {
    try {
      const now = new Date().toISOString();
      console.log('🔄 새 사용자 프로필 생성 시작:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        created_at: now
      });

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email || '',
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            profile_image_url: user.user_metadata?.avatar_url || null,
            user_level: UserRole.BASIC,
            company_name: user.user_metadata?.company_name || null,
            created_at: now,
            updated_at: now
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ 사용자 프로필 생성 실패:', error);
      } else {
        console.log('✅ 사용자 프로필 생성됨:', {
          id: data.id,
          email: data.email,
          company_name: data.company_name || '없음',
          created_at: data.created_at
        });
        setUserProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('❌ 프로필 생성 오류:', error);
    }
  };

  // 인증 상태 변경 감지
  useEffect(() => {
    // authListener가 이미 있는지 확인하는 플래그
    let mounted = true;

    // 세션 초기 설정
    console.log('🚀 AuthProvider 초기화', { initialSession });
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, newSession: Session | null) => {
      console.log('🔄 인증 상태 변경:', event);
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user || null);
      }
    });

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ 이메일 로그인 실패:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ signInWithEmail 오류:', error);
      throw error;
    }
  };

  // 이메일/비밀번호 회원가입
  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ 회원가입 실패:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ signUpWithEmail 오류:', error);
      throw error;
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?reset=true`,
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ 로그아웃 실패:', error);
        throw error;
      }
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
    resetPassword,
    signOut,
    clearBrowserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 