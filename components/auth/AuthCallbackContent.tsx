'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { UserRole } from '@/types/supabase';
import EmailVerificationModal from '@/components/auth/EmailVerificationModal';

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClientComponentClient<Database>();
      
      try {
        // 현재 세션 확인
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔍 초기 세션 상태:', {
          session: session ? {
            user: session.user ? {
              id: session.user.id,
              email: session.user.email,
              email_confirmed_at: session.user.email_confirmed_at,
              user_metadata: session.user.user_metadata
            } : null
          } : null
        });
        
        // 세션 새로고침 시도
        if (session?.user && !session.user.email_confirmed_at) {
          console.log('🔄 세션 새로고침 시도...');
          
          // 세션 새로고침을 위한 지연
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 세션 새로고침
          const { data: refreshedSession } = await supabase.auth.refreshSession();
          if (refreshedSession?.session) {
            console.log('✅ 세션 새로고침 성공');
            session = refreshedSession.session;
          }
        }

        // 이메일 인증 성공 여부 확인
        if (session?.user?.email_confirmed_at) {
          console.log('✅ 이메일 인증 성공:', {
            email: session.user.email,
            confirmed_at: session.user.email_confirmed_at,
            user_metadata: session.user.user_metadata
          });

          // 임시 저장된 사용자 데이터 확인
          const pendingUserData = localStorage.getItem('pendingUserData');
          console.log('📦 저장된 임시 데이터:', pendingUserData);
          
          if (pendingUserData) {
            const userData = JSON.parse(pendingUserData);
            console.log('📝 파싱된 사용자 데이터:', userData);
            
            // users 테이블에 데이터 upsert
            const { data: insertedData, error: profileError } = await supabase
              .from('users')
              .upsert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  first_name: userData.first_name,
                  last_name: userData.last_name,
                  user_level: UserRole.BASIC,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ], {
                onConflict: 'id',
                ignoreDuplicates: false
              })
              .select();

            if (profileError) {
              console.error('❌ 사용자 프로필 생성 실패:', profileError);
              setVerificationStatus('error');
              setErrorMessage('프로필 생성에 실패했습니다. 관리자에게 문의해주세요.');
              setIsModalOpen(true);
              return;
            }

            console.log('✅ 사용자 프로필 생성/업데이트 성공:', insertedData);
            
            // 임시 데이터 삭제
            localStorage.removeItem('pendingUserData');
          }

          setVerificationStatus('success');
          setIsModalOpen(true);
          
          // 3초 후 메인 페이지로 이동하고 로그아웃
          setTimeout(async () => {
            setIsModalOpen(false);
            console.log('🔄 홈페이지로 이동 및 로그아웃...');
            
            // 로그아웃 처리
            await supabase.auth.signOut();
            
            // 홈페이지로 이동 및 새로고침
            window.location.href = '/';
          }, 3000);
        } else {
          console.error('❌ 이메일 인증 실패:', {
            email: session?.user?.email,
            error: '이메일이 인증되지 않았습니다.',
            user: session?.user ? {
              id: session.user.id,
              email: session.user.email,
              email_confirmed_at: session.user.email_confirmed_at,
              user_metadata: session.user.user_metadata
            } : null
          });
          setVerificationStatus('error');
          setErrorMessage('이메일 인증에 실패했습니다. 다시 시도해주세요.');
          setIsModalOpen(true);
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || '인증 처리 중 오류가 발생했습니다.');
        setIsModalOpen(true);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (!verificationStatus) {
    return null;
  }

  return (
    <EmailVerificationModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        window.location.href = '/';
      }}
      status={verificationStatus}
      errorMessage={errorMessage}
    />
  );
} 