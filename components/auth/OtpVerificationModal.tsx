'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthContext';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess: () => void;
}

const OtpVerificationModal = ({ isOpen, onClose, email, onSuccess }: OtpVerificationModalProps) => {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { verifySignupOtp, resendSignupOtp } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // 자동으로 다음 필드로 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 6자리 모두 입력되면 자동 검증
    if (newOtpCode.every(digit => digit !== '')) {
      handleVerifyOtp(newOtpCode.join(''));
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
      setError('6자리 코드를 모두 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await verifySignupOtp(email, codeToVerify);
      console.log('✅ OTP 검증 성공 - 회원가입 완료');
      
      // 성공 상태 표시
      setIsSuccess(true);
      setIsVerifying(false);
      
      // 2초 후 onSuccess 콜백 실행
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ OTP 검증 실패:', error);
      
      // 에러 메시지 분류
      if (error.message?.includes('invalid') || error.message?.includes('expired')) {
        setError('인증 코드가 올바르지 않거나 만료되었습니다.');
      } else if (error.message?.includes('too_many_requests')) {
        setError('너무 많은 시도를 했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('인증에 실패했습니다. 다시 시도해주세요.');
      }
      
      // OTP 코드 초기화
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
      console.log('✅ OTP 재전송 성공');
      
      // 타이머 재시작
      setTimeLeft(180);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
    } catch (error: any) {
      console.error('❌ OTP 재전송 실패:', error);
      setError('코드 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
      <div className="relative bg-[#050a16] rounded-xl w-full max-w-md mx-4 shadow-xl animate-fadeIn border border-[#1f2937]">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#1f2937]">
          <h2 className="text-xl font-bold text-white">
            {isSuccess ? '인증 완료' : '이메일 인증'}
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
                {/* 성공 아이콘 */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">인증 완료! 🎉</h3>
                <p className="text-[#C7C7CC]">
                  회원가입이 성공적으로 완료되었습니다.<br />
                  잠시 후 자동으로 이동됩니다.
                </p>
              </div>
              
              {/* 로딩 표시 */}
              <div className="flex justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-[#cba967] border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : (
            // 기존 OTP 입력 UI
            <>
              <div className="text-center mb-6">
                <p className="text-[#C7C7CC] mb-2">
                  다음 이메일로 6자리 인증 코드를 보내드렸습니다:
                </p>
                <p className="text-[#cba967] font-medium">{email}</p>
                <p className="text-sm text-[#C7C7CC] mt-2">
                  코드를 입력하여 회원가입을 완료해주세요.
                </p>
              </div>

              {/* OTP 입력 필드 */}
              <div className="flex justify-center space-x-3 mb-6">
                {otpCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                    disabled={isVerifying}
                  />
                ))}
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-200 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {/* 타이머 */}
              <div className="text-center mb-6">
                {timeLeft > 0 ? (
                  <p className="text-sm text-[#C7C7CC]">
                    코드 유효시간: <span className="text-[#cba967] font-medium">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-400">
                    코드가 만료되었습니다. 새 코드를 요청해주세요.
                  </p>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                {/* 검증 버튼 (수동) */}
                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={isVerifying || otpCode.some(digit => digit === '')}
                  className="w-full py-3 px-4 bg-[#cba967] hover:bg-[#b99856] text-black font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      인증 중...
                    </span>
                  ) : (
                    '인증하기'
                  )}
                </button>

                {/* 재전송 버튼 */}
                <button
                  onClick={handleResendOtp}
                  disabled={!canResend || isResending}
                  className="w-full py-3 px-4 border border-[rgba(255,255,255,0.1)] text-[#C7C7CC] rounded-lg hover:bg-[#131f36] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      재전송 중...
                    </span>
                  ) : (
                    canResend ? '새 코드 받기' : `재전송 가능 (${formatTime(timeLeft)})`
                  )}
                </button>
              </div>

              {/* 도움말 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[#C7C7CC]">
                  코드가 도착하지 않나요?<br />
                  스팸함을 확인하거나 몇 분 후 다시 시도해보세요.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal; 