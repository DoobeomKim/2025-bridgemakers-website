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
      try {
        const supabase = createClientComponentClient<Database>();
        
        console.log('🔄 Auth callback 처리 시작:', {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          userAgent: navigator.userAgent,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        });

        // URL에서 토큰 추출 (해시나 쿼리 파라미터)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const tokenType = urlParams.get('token_type') || hashParams.get('token_type');
        const type = urlParams.get('type') || hashParams.get('type');

        console.log('📋 추출된 토큰 정보:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          type,
          urlSearch: window.location.search,
          urlHash: window.location.hash
        });

        // 1. URL 파라미터로 세션 설정 시도
        if (accessToken && refreshToken) {
          console.log('🔑 URL 토큰으로 세션 설정 시도...');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ 세션 설정 실패:', sessionError);
            throw sessionError;
          }

          console.log('✅ 세션 설정 성공:', {
            userId: sessionData.session?.user?.id,
            email: sessionData.session?.user?.email,
            emailConfirmed: sessionData.session?.user?.email_confirmed_at
          });
        }

        // 2. 현재 세션 확인
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          console.error('❌ 세션 조회 실패:', getSessionError);
          throw getSessionError;
        }

        if (!session) {
          console.error('❌ 세션이 없습니다.');
          setVerificationStatus('error');
          setErrorMessage('인증 세션을 찾을 수 없습니다. 다시 시도해주세요.');
          setIsModalOpen(true);
          return;
        }

        console.log('📱 현재 세션 정보:', {
          userId: session.user.id,
          email: session.user.email,
          emailConfirmed: session.user.email_confirmed_at,
          provider: session.user.app_metadata?.provider,
          createdAt: session.user.created_at
        });

        // 이메일 인증 성공 여부 확인
        if (session?.user?.email_confirmed_at) {
          console.log('✅ 이메일 인증 성공:', {
            email: session.user.email,
            confirmed_at: session.user.email_confirmed_at,
            user_metadata: session.user.user_metadata
          });

          // 임시 저장된 사용자 데이터 확인 (다양한 저장소에서 확인)
          let pendingUserData = null;
          let dataSource = '';

          // localStorage 확인
          try {
            const localData = localStorage.getItem('pendingUserData');
            if (localData) {
              pendingUserData = JSON.parse(localData);
              dataSource = 'localStorage';
            }
          } catch (error) {
            console.warn('⚠️ localStorage 접근 실패:', error);
          }

          // sessionStorage 확인 (localStorage가 실패한 경우)
          if (!pendingUserData) {
            try {
              const sessionData = sessionStorage.getItem('pendingUserData');
              if (sessionData) {
                pendingUserData = JSON.parse(sessionData);
                dataSource = 'sessionStorage';
              }
            } catch (error) {
              console.warn('⚠️ sessionStorage 접근 실패:', error);
            }
          }

          // 쿠키 확인 (스토리지가 모두 실패한 경우)
          if (!pendingUserData) {
            try {
              const cookies = document.cookie.split(';');
              const pendingCookie = cookies.find(cookie => 
                cookie.trim().startsWith('pendingUserData=')
              );
              
              if (pendingCookie) {
                const cookieValue = pendingCookie.split('=')[1];
                const decodedValue = decodeURIComponent(cookieValue);
                pendingUserData = JSON.parse(decodedValue);
                dataSource = 'cookie';
              }
            } catch (error) {
              console.warn('⚠️ 쿠키 접근 실패:', error);
            }
          }

          // user_metadata에서 확인 (모든 저장소가 실패한 경우)
          if (!pendingUserData && session.user.user_metadata) {
            const { first_name, last_name } = session.user.user_metadata;
            if (first_name && last_name) {
              pendingUserData = {
                id: session.user.id,
                email: session.user.email,
                first_name,
                last_name,
              };
              dataSource = 'user_metadata';
            }
          }

          console.log('📦 저장된 임시 데이터:', { 
            data: pendingUserData, 
            source: dataSource 
          });
          
          if (pendingUserData) {
            console.log('📝 파싱된 사용자 데이터:', pendingUserData);
            
            // users 테이블에 데이터 upsert
            const { data: insertedData, error: profileError } = await supabase
              .from('users')
              .upsert([
                {
                  id: session.user.id,
                  email: session.user.email,
                  first_name: pendingUserData.first_name,
                  last_name: pendingUserData.last_name,
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
            
            // 임시 데이터 삭제 (모든 저장소에서)
            try {
              localStorage.removeItem('pendingUserData');
              sessionStorage.removeItem('pendingUserData');
              // 쿠키 삭제
              document.cookie = 'pendingUserData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            } catch (error) {
              console.warn('⚠️ 임시 데이터 삭제 실패:', error);
            }
          }

          setVerificationStatus('success');
          setIsModalOpen(true);
          
          // 3초 후 메인 페이지로 이동하고 로그아웃 (모바일 호환성 개선)
          setTimeout(async () => {
            setIsModalOpen(false);
            console.log('🔄 홈페이지로 이동 및 로그아웃...');
            
            try {
              // 로그아웃 처리
              await supabase.auth.signOut();
              
              // 브라우저 호환성을 위해 다양한 리다이렉트 방법 시도
              if (window.location.replace) {
                window.location.replace('/');
              } else {
                window.location.href = '/';
              }
              
              // 추가 새로고침 (필요한 경우)
              setTimeout(() => {
                if (window.location.pathname !== '/') {
                  window.location.reload();
                }
              }, 500);
            } catch (error) {
              console.error('❌ 로그아웃 실패:', error);
              // 로그아웃이 실패해도 홈으로 이동
              window.location.href = '/';
            }
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
        console.error('❌ Auth callback error:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || '인증 처리 중 오류가 발생했습니다.');
        setIsModalOpen(true);
      }
    };

    // 약간의 지연을 추가하여 브라우저가 URL을 완전히 로드하도록 함
    const timer = setTimeout(() => {
      handleCallback();
    }, 100);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  if (!verificationStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1526]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cba967] mb-4"></div>
          <p className="text-white text-lg font-medium">이메일 인증 처리 중...</p>
          <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <EmailVerificationModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        // 브라우저 호환성을 위한 다중 리다이렉트 방법
        try {
          if (window.location.replace) {
            window.location.replace('/');
          } else {
            window.location.href = '/';
          }
        } catch (error) {
          console.error('❌ 리다이렉트 실패:', error);
          router.push('/');
        }
      }}
      status={verificationStatus}
      errorMessage={errorMessage}
    />
  );
} 