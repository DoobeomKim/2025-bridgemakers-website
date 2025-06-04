'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthContext';
import { useMessages } from '@/hooks/useMessages';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  locale: string;
  onSuccess?: () => void;
}

const OtpVerificationModal = ({ isOpen, onClose, email, locale, onSuccess }: OtpVerificationModalProps) => {
  const messages = useMessages();
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { verifySignupOtp, resendSignupOtp } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // messages가 로드되지 않았을 때의 대체 텍스트
  const defaultMessages = {
    ko: {
      title: '이메일 인증',
      successTitle: '인증 완료',
      description: '다음 이메일로 6자리 인증 코드를 보내드렸습니다:',
      instruction: '코드를 입력하여 회원가입을 완료해주세요.',
      verifyButton: '인증하기',
      verifying: '인증 중...',
      resendButton: '새 코드 받기',
      resendButtonTimer: '재전송 가능 ({time})',
      resending: '재전송 중...',
      invalidCode: '6자리 코드를 모두 입력해주세요.',
      success: {
        title: '인증 완료! 🎉',
        description: '회원가입이 성공적으로 완료되었습니다.\n잠시 후 자동으로 이동됩니다.'
      }
    },
    en: {
      title: 'Email Verification',
      successTitle: 'Verification Complete',
      description: 'We\'ve sent a 6-digit verification code to:',
      instruction: 'Enter the code to complete your registration.',
      verifyButton: 'Verify',
      verifying: 'Verifying...',
      resendButton: 'Get New Code',
      resendButtonTimer: 'Resend available in ({time})',
      resending: 'Resending...',
      invalidCode: 'Please enter the 6-digit code.',
      success: {
        title: 'Verification Complete! 🎉',
        description: 'Your registration has been successfully completed.\nYou will be redirected shortly.'
      }
    }
  };

  // 현재 locale에 맞는 기본 메시지 선택
  const currentDefaultMessages = defaultMessages[locale as keyof typeof defaultMessages] || defaultMessages.en;

  // 3분 타이머
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setOtpCode(['', '', '', '', '', '']);
      setError(null);
      setTimeLeft(180);
      setCanResend(false);
      setIsResending(false);
      setIsSuccess(false);
      // 첫 번째 입력 필드에 포커스
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // OTP 입력 처리
  const handleOtpChange = (index: number, value: string) => {
    // 숫자만 허용
    if (!/^\d*$/.test(value)) return;

    setOtpCode(prev => {
      const newOtpCode = [...prev];
      newOtpCode[index] = value;
      
      // 6자리 모두 입력되면 자동 검증
      if (newOtpCode.every(digit => digit !== '')) {
        handleVerifyOtp(newOtpCode.join(''));
      }
      
      return newOtpCode;
    });

    // 자동으로 다음 필드로 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 백스페이스 처리
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // OTP 검증
  const handleVerifyOtp = async (code?: string) => {
    const codeToVerify = code || otpCode.join('');
    
    if (codeToVerify.length !== 6) {
      setError(messages?.auth?.verification?.error?.invalidCode || currentDefaultMessages.invalidCode);
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await verifySignupOtp(email, codeToVerify);
      setIsSuccess(true);
      setIsVerifying(false);
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
      
    } catch (error: any) {
      if (error.message?.includes('invalid') || error.message?.includes('expired')) {
        setError(messages?.auth?.verification?.error?.invalidCode || currentDefaultMessages.invalidCode);
      } else if (error.message?.includes('too_many_requests')) {
        setError(messages?.auth?.verification?.error?.tooManyAttempts || 'Too many attempts. Please try again later.');
      } else {
        setError(messages?.auth?.verification?.error?.default || 'Verification failed.');
      }
      
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setIsVerifying(false);
    }
  };

  // OTP 재전송
  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      await resendSignupOtp(email);
      
      // 타이머 재시작
      setTimeLeft(180);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error: any) {
      setError(messages?.auth?.verification?.error?.resend || '코드 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsResending(false);
    }
  };

  // ESC 키 이벤트 핸들러
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
    >
      <div 
        ref={modalRef}
        className="relative bg-[#050a16] rounded-xl w-full max-w-md mx-4 shadow-xl animate-fadeIn border border-[#1f2937]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1f2937]">
          <h2 className="text-xl font-bold text-white">
            {isSuccess 
              ? (messages?.auth?.verification?.successTitle || currentDefaultMessages.successTitle)
              : (messages?.auth?.verification?.title || currentDefaultMessages.title)
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isSuccess}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-6">
          {isSuccess ? (
            // 성공 상태 UI
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {messages?.auth?.verification?.success?.title || currentDefaultMessages.success.title}
                </h3>
                <p className="text-[#C7C7CC] whitespace-pre-line">
                  {messages?.auth?.verification?.success?.description || currentDefaultMessages.success.description}
                </p>
              </div>
            </div>
          ) : (
            // 입력 상태 UI
            <>
              <div className="text-center mb-6">
                <p className="text-[#C7C7CC] mb-1">
                  {messages?.auth?.verification?.description || currentDefaultMessages.description}
                </p>
                <p className="text-white font-semibold mb-4">{email}</p>
                <p className="text-[#C7C7CC]">
                  {messages?.auth?.verification?.instruction || currentDefaultMessages.instruction}
                </p>
              </div>

              {/* OTP 입력 필드 */}
              <div className="flex justify-center gap-2 mb-6">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-white bg-[#1f2937] rounded-lg border border-[#374151] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    disabled={isVerifying || isSuccess}
                  />
                ))}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              {/* 하단 버튼 */}
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={otpCode.join('').length !== 6 || isVerifying || isSuccess}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {isVerifying 
                    ? (messages?.auth?.verification?.verifying || currentDefaultMessages.verifying)
                    : (messages?.auth?.verification?.verifyButton || currentDefaultMessages.verifyButton)
                  }
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={!canResend || isResending || isSuccess}
                  className="text-[#C7C7CC] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResending 
                    ? (messages?.auth?.verification?.resending || currentDefaultMessages.resending)
                    : canResend
                      ? (messages?.auth?.verification?.resendButton || currentDefaultMessages.resendButton)
                      : (messages?.auth?.verification?.resendButtonTimer || currentDefaultMessages.resendButtonTimer).replace('{time}', formatTime(timeLeft))
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal; 