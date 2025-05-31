"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import AuthLoginModal from './AuthLoginModal';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending' | null;
  errorMessage: string;
  email?: string;
}

const EmailVerificationModal = ({ isOpen, onClose, status, errorMessage, email }: EmailVerificationModalProps) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [localStatus, setLocalStatus] = useState(status);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const { resendVerificationEmail, supabase } = useAuth();
  const router = useRouter();

  // 모바일 환경 감지
  const isMobile = typeof window !== 'undefined' && 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 이메일 인증 상태 확인
  useEffect(() => {
    if (!email || !isOpen) return;

    const checkVerificationStatus = async () => {
      try {
        setIsVerifying(true);
        
        // 사용자 정보 조회 (auth.users 테이블만 확인)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (!user) return;

        // 인증 상태 확인
        if (user.email_confirmed_at) {
          console.log('✅ 이메일 인증 확인됨:', {
            email: user.email,
            confirmed_at: user.email_confirmed_at
          });
          setLocalStatus('success');
          
          // 성공 시 3초 후 로그인 모달로 전환
          setTimeout(() => {
            onClose();
            setShowLoginModal(true);
          }, 3000);
        }
      } catch (error) {
        console.error('❌ 인증 상태 확인 실패:', error);
        setLocalStatus('error');
      } finally {
        setIsVerifying(false);
      }
    };

    const interval = setInterval(checkVerificationStatus, 2000);
    return () => clearInterval(interval);
  }, [email, isOpen, supabase, onClose]);

  const handleResendVerification = async () => {
    try {
      const targetEmail = email || localStorage.getItem('tempEmail');
      if (!targetEmail) {
        throw new Error('이메일 정보를 찾을 수 없습니다.');
      }
      
      console.log('🔄 인증 이메일 재전송 시도:', { email: targetEmail });
      await resendVerificationEmail(targetEmail);
      
      if (isMobile) {
        alert('인증 이메일이 재전송되었습니다. 이메일을 확인하거나 아래 OTP 입력을 이용하세요.');
        setShowOtpInput(true);
      } else {
        alert('인증 이메일이 재전송되었습니다. 이메일을 확인해주세요.');
      }
      
      setLocalStatus('pending');
    } catch (error) {
      console.error('❌ 이메일 재전송 실패:', error);
      alert('이메일 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setLocalStatus('error');
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpCode || !email) return;
    
    setIsSubmittingOtp(true);
    try {
      console.log('🔑 OTP 인증 시도:', { email, otp: otpCode });
      
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email'
      });

      if (error) {
        console.error('❌ OTP 인증 실패:', error);
        throw error;
      }

      if (session) {
        console.log('✅ OTP 인증 성공:', session.user.email);
        setLocalStatus('success');
        
        // 성공 시 처리 (AuthCallbackContent와 동일한 로직)
        setTimeout(() => {
          onClose();
          window.location.href = '/';
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ OTP 인증 오류:', error);
      alert(error.message || 'OTP 인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#050a16] rounded-xl w-full max-w-md mx-4 shadow-xl border border-[#1f2937]">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1f2937]">
          <div className="text-xl font-bold text-white">
            <span>이메일 인증</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {localStatus === 'success' ? (
            <div className="text-center">
              <div className="bg-[rgba(53,202,133,0.1)] border border-[rgba(53,202,133,0.3)] text-[#35CA85] p-4 rounded-lg mb-4">
                이메일 인증이 완료되었습니다!
              </div>
              <p className="text-[#C7C7CC] mt-2">
                3초 후 로그인 페이지로 이동합니다...
              </p>
            </div>
          ) : localStatus === 'error' ? (
            <div className="text-center">
              <div className="bg-[rgba(237,87,87,0.1)] border border-[rgba(237,87,87,0.3)] text-[#ED5757] p-4 rounded-lg mb-4">
                {errorMessage || '이메일 인증에 실패했습니다.'}
              </div>
              <div className="space-y-4 mt-6">
                <button
                  onClick={handleResendVerification}
                  className="w-full py-3 px-4 bg-[#cba967] text-black font-medium rounded-lg hover:bg-[#b99a58] transition-colors"
                >
                  인증 이메일 재전송
                </button>
                {isMobile && (
                  <button
                    onClick={() => setShowOtpInput(true)}
                    className="w-full py-3 px-4 border border-[#cba967] text-[#cba967] rounded-lg hover:bg-[rgba(203,169,103,0.1)] transition-colors"
                  >
                    OTP 코드로 인증
                  </button>
                )}
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-4 border border-[#1f2937] text-[#C7C7CC] rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  홈페이지로 이동
                </button>
                <button
                  onClick={() => window.location.href = 'mailto:support@bridgemakers.co.kr'}
                  className="w-full py-3 px-4 border border-[#1f2937] text-[#C7C7CC] rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  관리자에게 문의
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-[rgba(203,169,103,0.1)] border border-[rgba(203,169,103,0.3)] text-[#cba967] p-4 rounded-lg mb-4">
                이메일 인증을 진행해주세요
              </div>
              
              {isMobile && (
                <div className="bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.3)] text-[#3B82F6] p-3 rounded-lg mb-4 text-sm">
                  📱 모바일에서는 OTP 코드 입력을 권장합니다
                </div>
              )}
              
              <p className="text-[#C7C7CC] mt-2 mb-4">
                인증 이메일을 확인하고 인증 링크를 클릭해주세요.
              </p>
              
              {showOtpInput && (
                <div className="mb-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-lg border border-[#1f2937]">
                  <h4 className="text-white font-medium mb-3">OTP 코드 입력</h4>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6자리 OTP 코드 입력"
                    maxLength={6}
                    className="w-full px-3 py-2 bg-[#1a1f36] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#cba967] text-center text-lg tracking-wider"
                  />
                  <button
                    onClick={handleOtpSubmit}
                    disabled={otpCode.length !== 6 || isSubmittingOtp}
                    className="w-full mt-3 py-2 px-4 bg-[#35CA85] text-white font-medium rounded-lg hover:bg-[#2db874] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingOtp ? '인증 중...' : 'OTP 인증'}
                  </button>
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  className="w-full py-3 px-4 bg-[#cba967] text-black font-medium rounded-lg hover:bg-[#b99a58] transition-colors"
                  disabled={isVerifying}
                >
                  {isVerifying ? '인증 확인 중...' : '인증 이메일 재전송'}
                </button>
                
                {isMobile && !showOtpInput && (
                  <button
                    onClick={() => setShowOtpInput(true)}
                    className="w-full py-3 px-4 border border-[#cba967] text-[#cba967] rounded-lg hover:bg-[rgba(203,169,103,0.1)] transition-colors"
                  >
                    OTP 코드로 인증
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showLoginModal && (
        <AuthLoginModal
          isOpen={true}
          onClose={() => setShowLoginModal(false)}
          initialMode="login"
          locale="ko"
        />
      )}
    </div>
  );
};

export default EmailVerificationModal; 