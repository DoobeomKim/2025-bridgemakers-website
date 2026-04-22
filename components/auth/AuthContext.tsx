'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
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
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<{ user: User; needsOtpVerification: boolean; }>;
  verifySignupOtp: (email: string, otpCode: string) => Promise<{ user: User; session: Session; }>;
  resendSignupOtp: (email: string) => Promise<void>;
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

  // 스테일 클로저 없이 최신 값을 참조하기 위한 refs
  const userProfileRef = useRef<UserProfile | null>(null);
  const lastProcessedUserIdRef = useRef<string | null>(initialSession?.user?.id || null);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  // 세션 상태 체크 함수
  const checkSession = async () => {
    try {
      // 이미 세션이 있다면 불필요한 체크 스킵
      if (session?.user && userProfile) {
        console.log('✅ 유효한 세션 존재 - 체크 스킵');
        return;
      }

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      console.log('🔍 세션 상태 확인:', {
        hasSession: !!currentSession,
        userId: currentSession?.user?.id
      });
      
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        await loadUserProfile(currentSession.user);
      } else {
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ 세션 체크 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 액션에 따른 세션 체크
  useEffect(() => {
    console.log('🔄 세션 체크 이벤트 리스너 설정...');

    // 페이지 새로고침 전 세션 체크
    const handleBeforeUnload = () => {
      console.log('🔄 페이지 새로고침 - 세션 체크');
    };

    // 온라인 상태 변경 시 세션 체크
    const handleOnline = () => {
      console.log('🌐 온라인 상태 복귀 - 세션 체크');
      checkSession();
    };

    // 브라우저 네비게이션(뒤로가기/앞으로가기) 시 세션 체크
    const handleNavigation = () => {
      console.log('🔙 브라우저 네비게이션 - 세션 체크');
      checkSession();
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('popstate', handleNavigation);

    // 초기 세션 체크
    checkSession();

    // 클린업
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Auth 상태 변경 감지 (로그인/로그아웃 이벤트만)
  useEffect(() => {
    console.log('🔐 Auth 이벤트 리스너 설정...');
    
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔔 Auth 이벤트 발생:', event, {
        hasSession: !!currentSession,
        userId: currentSession?.user?.id
      });

      if (event === 'SIGNED_IN' && currentSession?.user) {
        const incomingUserId = currentSession.user.id;

        // 동일 사용자의 토큰 갱신(TOKEN_REFRESHED → SIGNED_IN)인 경우:
        // setUser로 새 객체를 넘기되, loadUserProfile은 재호출하지 않아 불필요한 리렌더를 최소화
        if (
          lastProcessedUserIdRef.current === incomingUserId &&
          userProfileRef.current !== null
        ) {
          console.log('🔄 동일 사용자 토큰 갱신 - 세션만 조용히 업데이트');
          setSession(currentSession);
          setUser(currentSession.user);
          return;
        }

        // 신규 로그인이거나 프로필이 아직 없는 경우에만 전체 플로우 실행
        lastProcessedUserIdRef.current = incomingUserId;
        setSession(currentSession);
        setUser(currentSession.user);
        await loadUserProfile(currentSession.user);

      } else if (event === 'SIGNED_OUT') {
        lastProcessedUserIdRef.current = null;
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      console.log('🔄 Auth 이벤트 리스너 정리...');
      authListener.unsubscribe();
    };
  }, []);

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
  const loadUserProfile = async (authUser: User | null, forceReload: boolean = false) => {
    if (!authUser) {
      console.log('🚫 authUser가 null이므로 프로필 로드 중단');
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    // ✅ 강제 새로고침이 아닐 때만 중복 검사
    if (!forceReload && userProfile && userProfile.id === authUser.id) {
      console.log('✅ 이미 같은 사용자의 프로필이 로드되어 있음 - DB 쿼리 건너뛰기:', {
        userId: authUser.id,
        profileId: userProfile.id,
        email: userProfile.email
      });
      setIsLoading(false);
      return;
    }

    // 🔧 캐시 우선 체크 - 캐시가 있으면 DB 쿼리 완전 스킵
    if (!forceReload && typeof window !== 'undefined') {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          const { data, timestamp, expiresIn } = JSON.parse(cachedProfile);
          const isExpired = Date.now() - timestamp > expiresIn;
          
          if (!isExpired && data.id === authUser.id) {
            console.log('🎯 캐시된 프로필 발견 - DB 쿼리 완전 스킵:', { 
              userId: data.id, 
              email: data.email,
              firstName: data.first_name,
              lastName: data.last_name,
              cacheAge: Math.round((Date.now() - timestamp) / 1000) + '초',
              source: 'localStorage_cache'
            });
            
            // 이메일 인증 상태는 user_metadata.email_verified만 사용
            const isEmailVerified = authUser.user_metadata?.email_verified || false;
            const userProfileData = {
              ...data,
              email_confirmed_at: isEmailVerified ? new Date().toISOString() : null
            };
            
            setUserProfile(userProfileData as UserProfile);
            setIsLoading(false);
            return; // 🎯 여기서 완전히 종료 - DB 쿼리 없음
          } else {
            console.log('🗑️ 캐시 만료 또는 다른 사용자 - 캐시 삭제 후 DB에서 새로 로드');
            localStorage.removeItem('userProfile');
          }
        } catch (error) {
          console.error('❌ 캐시 파싱 오류:', error);
          localStorage.removeItem('userProfile');
        }
      }
    }

    if (forceReload) {
      console.log('🔥 강제 새로고침 모드 - 캐시 무시하고 DB에서 직접 로드');
    } else {
      console.log('💾 캐시 없음 - DB에서 새로 로드 후 캐시 생성');
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

      console.log('📊 데이터베이스에서 프로필 조회 시작...');
      console.log('🔗 Supabase 연결 정보:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        authUserId: authUser.id
      });

      // 연결 테스트 제거 - 직접 프로필 쿼리 시도
      // 타임아웃을 15초로 늘리고 더 안전한 쿼리 사용
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle(); // single() 대신 maybeSingle() 사용 (더 안전)

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout after 15 seconds')), 15000);
      });

      console.log('⏰ 타임아웃 15초로 데이터베이스 쿼리 실행...');

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
        
        // 에러가 발생해도 재시도 가능하도록 isLoading은 여기서 false로 설정하지 않음
        console.log('⚠️ 프로필 로드 실패 - 하지만 재시도 가능하도록 유지');
        setUserProfile(null);
      }

      if (!profile) {
        console.error('❌ 프로필 데이터가 없음');
        setUserProfile(null);
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
      
      // 프로필 정보를 localStorage에 캐싱 (세션 기간 동안 유지)
      if (typeof window !== 'undefined') {
        try {
          const cacheData = {
            data: userProfileData,
            timestamp: Date.now(),
            expiresIn: 24 * 60 * 60 * 1000, // 24시간 (세션보다 길게)
            sessionId: authUser.id // 세션 연동
          };
          localStorage.setItem('userProfile', JSON.stringify(cacheData));
          console.log('💾 프로필 캐시 저장 완료 (24시간 유지):', {
            userId: userProfileData.id,
            cacheExpiry: new Date(Date.now() + cacheData.expiresIn).toLocaleString()
          });
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
      
      // 치명적 오류 시에도 재시도 가능하도록 상태 설정
      console.log('💔 치명적 오류 발생 - 하지만 사용자가 새로고침하면 재시도 가능');
      setUserProfile(null);
    } finally {
      console.log('🔚 프로필 로드 과정 완료 - isLoading을 false로 설정');
      setIsLoading(false);
    }
  };

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

  // 이메일/비밀번호 회원가입 (OTP 방식)
  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('🔄 OTP 방식 회원가입 시도:', { email, firstName, lastName });
      
      // 사용자 데이터 객체 생성
      const userData = {
        email,
        first_name: firstName,
        last_name: lastName,
      };

      // 1. auth.users 테이블에 사용자 생성 (OTP 방식 - 이메일 링크 없음)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData, // user_metadata에 데이터 저장
          // emailRedirectTo 제거 - OTP 방식에서는 불필요
        },
      });

      if (error) {
        console.error('❌ OTP 회원가입 실패:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('사용자 생성 실패');
      }

      console.log('✅ OTP 회원가입 성공 - 이메일로 6자리 코드 전송됨:', {
        userId: data.user.id,
        email: data.user.email,
        needsEmailConfirmation: !data.session // 세션이 없으면 OTP 확인 필요
      });

      // 임시 데이터를 여러 저장소에 저장 (OTP 검증 완료까지 보관)
      const pendingData = {
        id: data.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10분 후 만료
      };

      // localStorage에 저장 시도
      try {
        localStorage.setItem('pendingUserData', JSON.stringify(pendingData));
        console.log('✅ localStorage에 OTP 대기 데이터 저장 성공');
      } catch (error) {
        console.warn('⚠️ localStorage 저장 실패:', error);
      }

      // sessionStorage에도 백업 저장
      try {
        sessionStorage.setItem('pendingUserData', JSON.stringify(pendingData));
        console.log('✅ sessionStorage에 OTP 대기 데이터 저장 성공');
      } catch (error) {
        console.warn('⚠️ sessionStorage 저장 실패:', error);
      }

      return {
        user: data.user,
        needsOtpVerification: true
      };

    } catch (error) {
      console.error('❌ signUpWithEmail OTP 오류:', error);
      throw error;
    }
  };

  // OTP 검증 함수
  const verifySignupOtp = async (email: string, otpCode: string) => {
    try {
      console.log('🔄 OTP 검증 시도:', { email, otpCode: otpCode.length + '자리' });
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });

      if (error) {
        console.error('❌ OTP 검증 실패:', error);
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('OTP 검증 후 세션 생성 실패');
      }

      console.log('✅ OTP 검증 성공:', {
        userId: data.user.id,
        email: data.user.email,
        sessionId: data.session.access_token.substring(0, 10) + '...'
      });

      // 임시 저장된 사용자 데이터 확인
      let pendingUserData = null;
      try {
        const localData = localStorage.getItem('pendingUserData');
        if (localData) {
          pendingUserData = JSON.parse(localData);
        }
      } catch (error) {
        console.warn('⚠️ 임시 데이터 조회 실패:', error);
      }

      // 사용자 프로필 생성 (users 테이블에 저장)
      if (pendingUserData) {
        const profileData = {
          id: data.user.id,
          email: data.user.email,
          first_name: pendingUserData.first_name,
          last_name: pendingUserData.last_name,
          user_level: 'user' as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([profileData]);

        if (insertError) {
          console.error('❌ 프로필 생성 실패:', insertError);
          // 프로필 생성 실패해도 인증은 완료된 상태이므로 계속 진행
        } else {
          console.log('✅ 사용자 프로필 생성 성공');
        }
      }

      // 임시 데이터 삭제
      try {
        localStorage.removeItem('pendingUserData');
        sessionStorage.removeItem('pendingUserData');
        document.cookie = 'pendingUserData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        console.log('✅ 임시 데이터 정리 완료');
      } catch (error) {
        console.warn('⚠️ 임시 데이터 삭제 실패:', error);
      }

      // 세션과 사용자 상태 업데이트
      setUser(data.user);
      setSession(data.session);
      
      // 프로필 로드
      await loadUserProfile(data.user, true);

      return {
        user: data.user,
        session: data.session
      };

    } catch (error) {
      console.error('❌ verifySignupOtp 오류:', error);
      throw error;
    }
  };

  // OTP 재전송 함수
  const resendSignupOtp = async (email: string) => {
    try {
      console.log('🔄 OTP 재전송 시도:', { email });
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error('❌ OTP 재전송 실패:', error);
        throw error;
      }

      console.log('✅ OTP 재전송 성공');
    } catch (error) {
      console.error('❌ resendSignupOtp 오류:', error);
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

  // 프로필 새로고침 함수 (프로필 수정 후 호출)
  const refreshUserProfile = async () => {
    try {
      if (!user) {
        console.warn('⚠️ 사용자가 로그인되지 않아 프로필을 새로고침할 수 없습니다.');
        return;
      }

      console.log('🔄 프로필 새로고침 시작 (캐시 무효화 포함)...');
      
      // 1. 캐시 즉시 삭제 (중요!)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userProfile');
        console.log('🗑️ 기존 프로필 캐시 삭제 완료');
      }
      
      // 2. 현재 프로필 상태 초기화
      setUserProfile(null);
      
      // 3. 새로고침 시작
      setIsLoading(true);
      
      // 4. DB에서 최신 프로필 강제 로드
      console.log('📡 DB에서 최신 프로필 강제 로드...');
      await loadUserProfile(user, true);
      
      console.log('✅ 프로필 새로고침 완료 (캐시도 새로 생성됨)');
    } catch (error) {
      console.error('❌ 사용자 프로필 새로고침 중 오류:', error);
      setIsLoading(false);
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
    verifySignupOtp,
    resendSignupOtp,
    resendVerificationEmail,
    resetPassword,
    signOut,
    clearBrowserData,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 