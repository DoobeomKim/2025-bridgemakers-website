"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from "next/navigation";

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
  
  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  }, [isOpen, onClose]);
  
  // ESC 키로 모달 닫기
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

  // 사용자가 로그인되면 모달 닫기
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);
  
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
      errors.email = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = '유효한 이메일 형식이 아닙니다.';
      isValid = false;
    }
    
    // 비밀번호 검증
    if (mode !== 'forgot') {
      if (!password) {
        errors.password = '비밀번호를 입력해주세요.';
        isValid = false;
      } else if (password.length < 6) {
        errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
        isValid = false;
      }
    }
    
    // 회원가입 모드일 때 추가 검증
    if (mode === 'register') {
      if (!firstName) {
        errors.firstName = '이름을 입력해주세요.';
        isValid = false;
      }
      
      if (!lastName) {
        errors.lastName = '성을 입력해주세요.';
        isValid = false;
      }
      
      if (!confirmPassword) {
        errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        isValid = false;
      } else if (password !== confirmPassword) {
        errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        isValid = false;
      }
      
      if (!agreeTerms) {
        errors.terms = '이용약관에 동의해주세요.';
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
        await signInWithEmail(email, password);
      } else if (mode === 'register') {
        await signUpWithEmail(email, password, firstName, lastName);
        setError("가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.");
        setTimeout(() => {
          setMode('login');
        }, 3000);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setError("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
      }
    } catch (error: any) {
      console.error(`❌ ${mode} 실패:`, error);
      setError(error.message || `${mode} 처리 중 오류가 발생했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
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
            {mode === 'login' ? '환영합니다' : 
             mode === 'register' ? '계정 만들기' : 
             '비밀번호 찾기'}
          </h2>
          
          {/* 부제목 */}
          <p className="text-center text-[#C7C7CC] mb-6">
            {mode === 'login' ? '계정에 로그인하여 브릿지메이커스의 서비스를 이용하세요' : 
             mode === 'register' ? '브릿지메이커스에 가입하고 서비스를 이용하세요' : 
             '비밀번호를 재설정할 이메일을 입력하세요'}
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#C7C7CC] mb-1">이름 <span className="text-[#cba967]">*</span></label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                      placeholder="이름"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                    />
                    {formErrors.firstName && <p className="mt-1 text-red-500 text-xs">{formErrors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#C7C7CC] mb-1">성 <span className="text-[#cba967]">*</span></label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                      placeholder="성"
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
              <label htmlFor="email" className="block text-sm font-medium text-[#C7C7CC] mb-1">이메일 {mode === 'register' && <span className="text-[#cba967]">*</span>}</label>
              <input
                type="email"
                id="email"
                className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {formErrors.email && <p className="mt-1 text-red-500 text-xs">{formErrors.email}</p>}
            </div>
            
            {/* 비밀번호 필드 */}
            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#C7C7CC] mb-1">비밀번호 {mode === 'register' && <span className="text-[#cba967]">*</span>}</label>
                <input
                  type="password"
                  id="password"
                  className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                  placeholder="비밀번호"
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#C7C7CC] mb-1">비밀번호 확인 <span className="text-[#cba967]">*</span></label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full bg-[#131f36] border border-[rgba(255,255,255,0.1)] rounded-lg py-2 px-3 text-white focus:ring-[#cba967] focus:border-[#cba967] transition"
                  placeholder="비밀번호 확인"
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
                    자동 로그인
                  </label>
                </div>
                <div className="ml-auto">
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')} 
                      className="text-[#cba967] hover:underline text-sm"
                    >
                      비밀번호 찾기
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
                    브릿지메이커스의 <Link href={`/${locale}/terms`} className="text-[#cba967] hover:underline">서비스 이용약관</Link>과 <Link href={`/${locale}/privacy`} className="text-[#cba967] hover:underline">개인정보 처리방침</Link>에 동의합니다 <span className="text-[#cba967]">*</span>
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
                  처리 중...
                </span>
              ) : (
                mode === 'login' ? '로그인' : 
                mode === 'register' ? '회원가입' : 
                '비밀번호 재설정 이메일 보내기'
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
                    또는
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
                    <span>구글 계정으로 로그인</span>
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
                    <span>애플 계정으로 로그인</span>
                  </button>
                </div>
              )}
              
              <div className="text-center mt-6">
                {mode === 'login' ? (
                  <p className="text-[#C7C7CC] text-sm">
                    계정이 없으신가요? <button onClick={() => setMode('register')} className="text-[#cba967] hover:underline">회원가입</button>
                  </p>
                ) : (
                  <p className="text-[#C7C7CC] text-sm">
                    이미 계정이 있으신가요? <button onClick={() => setMode('login')} className="text-[#cba967] hover:underline">로그인</button>
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
                로그인으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLoginModal; 