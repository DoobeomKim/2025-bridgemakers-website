'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserLevel } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userProfile: null,
  loading: true,
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface ClientAuthProviderProps {
  children: ReactNode;
}

const ClientAuthProvider = ({ children }: ClientAuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 정보 조회
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      if (userProfile?.id === userId) {
        console.log('✅ Profile already exists, skipping fetch');
        setLoading(false);
        return true;
      }

      const supabase = createClient();
      console.log('📡 Sending profile request to database...');
      
      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          company_name,
          profile_image_url,
          user_level,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single<UserProfile>();

      if (error) {
        console.error('❌ Profile fetch error:', error.message);
        setSession(null);
        setUserProfile(null);
        sessionStorage.removeItem('userProfile');
        setLoading(false);
        return false;
      }

      if (profile) {
        console.log('✅ Profile fetched successfully:', {
          id: profile.id,
          email: profile.email,
          name: `${profile.first_name} ${profile.last_name}`
        });
        setUserProfile({
          ...profile,
          user_level: profile.user_level as UserLevel
        });
        sessionStorage.setItem('userProfile', JSON.stringify(profile));
        setLoading(false);
        return true;
      }
      
      console.warn('⚠️ No profile found for user:', userId);
      setLoading(false);
      return false;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      setSession(null);
      setUserProfile(null);
      sessionStorage.removeItem('userProfile');
      setLoading(false);
      return false;
    }
  };

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single<UserProfile>();

      if (error) throw error;

      if (data) {
        setUserProfile({
          ...data,
          user_level: data.user_level as UserLevel
        });
        sessionStorage.setItem('userProfile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      sessionStorage.removeItem('userProfile');
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🚀 ClientAuthProvider initialized');

    // Supabase 클라이언트는 한 번만 초기화
    const supabase = createClient();

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, stopping initialization');
          return;
        }
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setSession(null);
          setUserProfile(null);
          sessionStorage.removeItem('userProfile');
          setLoading(false);
          return;
        }

        if (!session) {
          console.log('ℹ️ No session found');
          setSession(null);
          setUserProfile(null);
          sessionStorage.removeItem('userProfile');
          setLoading(false);
          return;
        }

        console.log('✅ Valid session found:', {
          user: session.user.email,
          expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
        });
        setSession(session);

        if (session?.user) {
          console.log('🔄 Attempting to fetch user profile...');
          const profileFetched = await fetchUserProfile(session.user.id);
          if (!profileFetched) {
            console.log('❌ Failed to fetch profile, clearing session');
            setSession(null);
            setUserProfile(null);
          } else {
            console.log('✅ Profile fetch completed successfully');
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setSession(null);
        setUserProfile(null);
        sessionStorage.removeItem('userProfile');
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('🏁 Auth initialization completed. Final state:', {
            hasSession: !!session,
            hasProfile: !!userProfile,
            isLoading: false
          });
        }
      }
    };

    // 초기화 즉시 실행
    initializeAuth();

    // 세션 변경 이벤트 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state changed:', {
        event,
        hasSession: !!session,
        user: session?.user?.email
      });
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in');
        setSession(session);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setSession(null);
        setUserProfile(null);
        sessionStorage.removeItem('userProfile');
      }
    });

    return () => {
      console.log('🧹 ClientAuthProvider cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      userProfile,
      loading,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default ClientAuthProvider; 