"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from "next/navigation";
import OtpVerificationModal from './OtpVerificationModal';
import { useMessages } from '@/hooks/useMessages';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  initialMode?: 'login' | 'register' | 'forgot';
}

// 폼 에러 타입 정의
interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  terms?: string;
}

const AuthLoginModal = ({ isOpen, onClose, locale, initialMode = 'login' }: LoginModalProps) => {
  const messages = useMessages();
  // 현재 모드 (로그인, 회원가입, 비밀번호 찾기)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // 로그인 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    terms: ''
  });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const { signInWithEmail, signUpWithEmail, resetPassword, user } = useAuth();
  const router = useRouter();
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // OTP 인증 모달이 열려있을 때는 외부 클릭 무시
      if (showVerificationModal) return;
      
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, showVerificationModal]);
  
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      // OTP 인증 모달이 열려있을 때는 ESC 키 무시
      if (showVerificationModal) return;
      
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
  }, [isOpen, onClose, showVerificationModal]);

  // 사용자가 로그인되면 모달 닫기 (단, OTP 검증 중일 때는 제외)
  useEffect(() => {
    if (user && !showVerificationModal) {
      onClose();
    }
  }, [user, onClose, showVerificationModal]);
  
  // 모드 변경 시 에러 초기화
  useEffect(() => {
    setError(null);
    setFormErrors({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      terms: ''
    });
  }, [mode]);
  
  // 폼 검증
  const validateForm = (): boolean => {
    const errors: FormErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      terms: ''
    };
    let isValid = true;
    
    // 이메일 검증
    if (!email) {
      errors.email = messages.auth.login.modal.emailError;
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = messages.auth.login.modal.emailInvalid;
      isValid = false;
    }
    
    // 비밀번호 검증
    if (mode !== 'forgot') {
      if (!password) {
        errors.password = messages.auth.login.modal.passwordError;
        isValid = false;
      } else if (password.length < 6) {
        errors.password = messages.auth.login.modal.passwordInvalid;
        isValid = false;
      }
    }
    
    // 회원가입 모드일 때 추가 검증
    if (mode === 'register') {
      if (!firstName) {
        errors.firstName = messages.auth.login.register.firstNameError;
        isValid = false;
      }
      
      if (!lastName) {
        errors.lastName = messages.auth.login.register.lastNameError;
        isValid = false;
      }
      
      if (!confirmPassword) {
        errors.confirmPassword = messages.auth.login.register.confirmPasswordError;
        isValid = false;
      } else if (password !== confirmPassword) {
        errors.confirmPassword = messages.auth.login.register.confirmPasswordMismatch;
        isValid = false;
      }
      
      if (!agreeTerms) {
        errors.terms = messages.auth.login.register.termsError;
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'login') {
        try {
          await signInWithEmail(email, password);
        } catch (error: any) {
          console.error('❌ 로그인 실패:', error);
          setError(messages.auth.login.modal.error);
          throw error;
        }
      } else if (mode === 'register') {
        try {
          const result = await signUpWithEmail(email, password, firstName, lastName);
          
          if (result.needsOtpVerification) {
            console.log('✅ 회원가입 성공 - OTP 인증 필요');
            setVerificationEmail(email);
            setShowVerificationModal(true);
            setError(null);
          }
        } catch (error: any) {
          console.error('❌ 회원가입 실패:', error);
          setError(messages.auth.login.register.error);
          throw error;
        }
      } else if (mode === 'forgot') {
        try {
          await resetPassword(email);
          setError(null);
          alert(messages.auth.login.forgot.success);
          setMode('login');
        } catch (error: any) {
          console.error('❌ 비밀번호 재설정 실패:', error);
          setError(messages.auth.login.forgot.error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('처리 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto ${showVerificationModal ? 'pointer-events-none' : ''}`}>
        <div 
          ref={modalRef}
          className="relative bg-[#050a16] rounded-xl w-full max-w-md mx-4 shadow-xl animate-fadeIn border border-[#1f2937]"
          style={{ animationDuration: '0.3s' }}
        >
          {/* 헤더 - 로고와 닫기 버튼 */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-[#1f2937]">
            <div className="text-xl font-bold text-white">
              <span>BRIDGE</span>
              <span className="text-[#cba967]">M</span>
              <span>AKERS</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* 모달 내용 */}
          <div className="p-8">
            {/* 모달 제목 */}
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {mode === 'login' ? messages.auth.login.modal.title : 
               mode === 'register' ? messages.auth.login.register.title : 
               messages.auth.login.forgot.title}
            </h2>
            
            {/* 부제목 */}
            <p className="text-center text-[#C7C7CC] mb-6">
              {mode === 'login' ? messages.auth.login.modal.description : 
               mode === 'register' ? messages.auth.login.register.description : 
               messages.auth.login.forgot.description}
            </p>
            
            {/* 에러 메시지 */}
            {error && (
              <div className={`mb-4 p-3 ${error.includes('완료') || error.includes('전송') ? 'bg-green-900/30 border border-green-700 text-green-200' : 'bg-red-900/30 border border-red-700 text-red-200'} rounded-lg text-sm`}>
                {error}
              </div>
            )}
            
            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 회원가입 추가 필드 */}
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-[#C7C7CC] mb-1">{messages.auth.login.register.firstNameLabel}</label>
                      <input
                        type="text"
                        id="firstName"
                        className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                        placeholder={messages.auth.login.register.firstNamePlaceholder}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isLoading}
                      />
                      {formErrors.firstName && <p className="mt-1 text-red-500 text-xs">{formErrors.firstName}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-[#C7C7CC] mb-1">{messages.auth.login.register.lastNameLabel}</label>
                      <input
                        type="text"
                        id="lastName"
                        className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                        placeholder={messages.auth.login.register.lastNamePlaceholder}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isLoading}
                      />
                      {formErrors.lastName && <p className="mt-1 text-red-500 text-xs">{formErrors.lastName}</p>}
                    </div>
                  </div>
                </>
              )}
              
              {/* 이메일 필드 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#C7C7CC] mb-1">{messages.auth.login.modal.emailLabel} {mode === 'register' && <span className="text-[#cba967]">*</span>}</label>
                <input
                  type="email"
                  id="email"
                  className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                  placeholder={messages.auth.login.modal.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                {formErrors.email && <p className="mt-1 text-red-500 text-xs">{formErrors.email}</p>}
              </div>
              
              {/* 비밀번호 필드 */}
              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#C7C7CC] mb-1">{messages.auth.login.modal.passwordLabel} {mode === 'register' && <span className="text-[#cba967]">*</span>}</label>
                  <input
                    type="password"
                    id="password"
                    className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                    placeholder={messages.auth.login.modal.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {formErrors.password && <p className="mt-1 text-red-500 text-xs">{formErrors.password}</p>}
                </div>
              )}
              
              {/* 비밀번호 확인 필드 */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#C7C7CC] mb-1">{messages.auth.login.register.confirmPasswordLabel} <span className="text-[#cba967]">*</span></label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                    placeholder={messages.auth.login.register.confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {formErrors.confirmPassword && <p className="mt-1 text-red-500 text-xs">{formErrors.confirmPassword}</p>}
                </div>
              )}
              
              {/* 자동 로그인 체크박스 */}
              {mode === 'login' && (
                <div className="flex items-start mt-2">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-[#cba967] border-[rgba(255,255,255,0.3)] rounded focus:ring-[#cba967]"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-[#C7C7CC]">
                      {messages.auth.login.modal.rememberMe}
                    </label>
                  </div>
                  <div className="ml-auto">
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')} 
                        className="text-[#cba967] hover:underline text-sm"
                      >
                        {messages.auth.login.modal.forgotLink}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* 이용약관 동의 */}
              {mode === 'register' && (
                <div className="flex items-start mt-2">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="h-4 w-4 text-[#cba967] border-[rgba(255,255,255,0.3)] rounded focus:ring-[#cba967]"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="text-[#C7C7CC]">
                      {messages.auth.login.register.termsLabel}
                    </label>
                    {formErrors.terms && <p className="mt-1 text-red-500 text-xs">{formErrors.terms}</p>}
                  </div>
                </div>
              )}
              
              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#cba967] hover:bg-[#b99856] text-black font-medium rounded-lg transition mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {messages.auth.login.authenticating}
                  </span>
                ) : (
                  mode === 'login' ? messages.auth.login.modal.submitButton : 
                  mode === 'register' ? messages.auth.login.register.submitButton : 
                  messages.auth.login.forgot.submitButton
                )}
              </button>
            </form>
            
            {/* 모드 전환 버튼 */}
            {(mode === 'login' || mode === 'register') && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[rgba(255,255,255,0.1)]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-[#050a16] text-[#C7C7CC] text-sm">
                      {messages.auth.login.modal.or}
                    </span>
                  </div>
                </div>
                
                {/* 소셜 로그인 - 구글 */}
                {mode === 'login' && (
                  <div className="space-y-3">
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 border border-[rgba(255,255,255,0.1)] bg-white text-black rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition"
                      disabled
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span>{messages.auth.login.googleLogin}</span>
                    </button>
                    
                    {/* 소셜 로그인 - 애플 */}
                    <button
                      type="button"
                      className="w-full py-2.5 px-4 border border-[rgba(255,255,255,0.1)] bg-black text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-900 transition"
                      disabled
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                      </svg>
                      <span>{messages.auth.login.appleLogin}</span>
                    </button>
                  </div>
                )}
                
                <div className="text-center mt-6">
                  {mode === 'login' ? (
                    <p className="text-[#C7C7CC] text-sm">
                      {messages.auth.login.modal.noAccount} <button onClick={() => setMode('register')} className="text-[#cba967] hover:underline">{messages.auth.login.modal.registerLink}</button>
                    </p>
                  ) : (
                    <p className="text-[#C7C7CC] text-sm">
                      {messages.auth.login.modal.alreadyAccount} <button onClick={() => setMode('login')} className="text-[#cba967] hover:underline">{messages.auth.login.modal.loginLink}</button>
                    </p>
                  )}
                </div>
              </>
            )}
            
            {/* 비밀번호 찾기 - 로그인으로 돌아가기 */}
            {mode === 'forgot' && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setMode('login')}
                  className="text-[#cba967] hover:underline"
                >
                  {messages.auth.login.forgot.loginLink}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* OTP 인증 모달 */}
      <OtpVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          setShowVerificationModal(false);
          onClose();
        }}
        email={verificationEmail}
        locale={locale}
      />
    </>
  );
};

export default AuthLoginModal; 