"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { signIn, signUp, resetPassword } from "@/lib/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  initialMode?: 'login' | 'register' | 'forgot';
}

const LoginModal = ({ isOpen, onClose, locale, initialMode = 'login' }: LoginModalProps) => {
  // 현재 모드 (로그인, 회원가입, 비밀번호 찾기)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // 로그인 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 회원가입 상태
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    terms: false
  });
  
  // 폼 유효성 검증 상태 추가
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  
  // 공통 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail("");
      setPassword("");
      setRegisterForm({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        terms: false
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialMode]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // ESC 키 누르면 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // 이메일 유효성 검증 함수
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 비밀번호 유효성 검증 함수
  const validatePassword = (password: string): boolean => {
    // 최소 8자, 하나 이상의 대문자, 하나 이상의 소문자, 하나 이상의 숫자, 하나 이상의 특수문자
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // 폼 필드 변경 핸들러 수정
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setRegisterForm(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // 실시간 유효성 검증
    let error = "";
    
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        error = "유효한 이메일 주소를 입력해주세요.";
      }
    }
    
    if (name === 'password' && value) {
      if (!validatePassword(value)) {
        error = "비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다.";
      }
    }
    
    if (name === 'confirmPassword' && value) {
      if (value !== registerForm.password) {
        error = "비밀번호가 일치하지 않습니다.";
      }
    }
    
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    // 비밀번호가 변경되면 비밀번호 확인 필드도 검증
    if (name === 'password' && registerForm.confirmPassword) {
      const confirmError = value !== registerForm.confirmPassword 
        ? "비밀번호가 일치하지 않습니다." 
        : "";
      
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 로그인 API 호출
      const result = await signIn(email, password);
      
      if (!result.success) {
        throw new Error(result.error || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
      
      // 성공 시 모달 닫기
      onClose();
      
      // 페이지 새로고침으로 인증 상태 업데이트
      window.location.reload();
      
    } catch (error: any) {
      console.error("로그인 실패:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 회원가입 처리 함수 수정
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // 모든 필드 유효성 검증
    const errors = {
      email: !registerForm.email ? "이메일을 입력해주세요." : 
             !validateEmail(registerForm.email) ? "유효한 이메일 주소를 입력해주세요." : "",
      
      password: !registerForm.password ? "비밀번호를 입력해주세요." : 
                !validatePassword(registerForm.password) ? 
                "비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다." : "",
      
      confirmPassword: !registerForm.confirmPassword ? "비밀번호 확인을 입력해주세요." :
                       registerForm.password !== registerForm.confirmPassword ? 
                       "비밀번호가 일치하지 않습니다." : "",
      
      firstName: !registerForm.firstName ? "이름을 입력해주세요." : "",
      lastName: !registerForm.lastName ? "성을 입력해주세요." : "",
    };
    
    setFormErrors(errors);
    
    // 에러가 있는지 확인
    const hasErrors = Object.values(errors).some(error => error !== "");
    
    if (hasErrors) {
      setError("입력 정보를 확인해주세요.");
      return;
    }
    
    if (!registerForm.terms) {
      setError("서비스 이용약관과 개인정보 처리방침에 동의해주세요.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 회원가입 API 호출
      const result = await signUp(
        registerForm.email,
        registerForm.password,
        registerForm.firstName,
        registerForm.lastName
      );
      
      if (!result.success) {
        throw new Error(result.error || "회원가입 중 오류가 발생했습니다.");
      }
      
      // 성공 메시지 표시
      setSuccess("회원가입이 완료되었습니다! 로그인해주세요.");
      
      // 3초 후 로그인 모드로 전환
      setTimeout(() => {
        setSuccess(null);
        setMode('login');
      }, 3000);
      
    } catch (err: any) {
      console.error("회원가입 오류:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 비밀번호 재설정 처리
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const result = await resetPassword(email);
      
      if (!result.success) {
        throw new Error(result.error || "비밀번호 재설정 메일 발송에 실패했습니다.");
      }
      
      setSuccess("비밀번호 재설정 메일을 발송했습니다. 메일함을 확인해주세요.");
      
    } catch (err: any) {
      console.error("비밀번호 재설정 오류:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
      <div 
        ref={modalRef}
        className="bg-[#050a16] rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-[rgba(255,255,255,0.1)]"
        style={{ maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}
      >
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center">
            <div className="font-bold tracking-[0.5px] leading-[1.2] text-white font-roboto">
              <span className="text-[18px]">BRIDGE</span>
              <span className="text-[18px] text-[#cba967]">M</span>
              <span className="text-[18px]">AKERS</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#C7C7CC] hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* 모달 본문 */}
        <div className="p-6">
          {/* 타이틀 */}
          <div className="text-center mb-6">
            {mode === 'login' && (
              <>
                <h3 className="text-xl font-bold text-white">환영합니다</h3>
                <p className="text-[#C7C7CC] text-sm mt-1">
                  계정에 로그인하여 브릿지메이커스의 서비스를 이용하세요
                </p>
              </>
            )}
            
            {mode === 'register' && (
              <>
                <h3 className="text-xl font-bold text-white">계정 만들기</h3>
                <p className="text-[#C7C7CC] text-sm mt-1">
                  브릿지메이커스에 가입하고 서비스를 이용하세요
                </p>
              </>
            )}
            
            {mode === 'forgot' && (
              <>
                <h3 className="text-xl font-bold text-white">비밀번호 재설정</h3>
                <p className="text-[#C7C7CC] text-sm mt-1">
                  등록한 이메일로 비밀번호 재설정 링크를 보내드립니다
                </p>
              </>
            )}
          </div>
          
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-[rgba(237,87,87,0.1)] border border-[rgba(237,87,87,0.3)] text-[#ED5757] p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {/* 성공 메시지 */}
          {success && (
            <div className="bg-[rgba(53,202,133,0.1)] border border-[rgba(53,202,133,0.3)] text-[#35CA85] p-4 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          {/* 로그인 폼 */}
          {mode === 'login' && !success && (
            <>
              <form onSubmit={handleLogin} className="space-y-4 mb-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                    placeholder="이메일"
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                    placeholder="비밀번호"
                    autoComplete="current-password"
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#cba967] focus:ring-[#cba967] border-gray-700 rounded bg-[#0d1526]"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      자동 로그인
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-[#cba967] hover:text-[#b99a58]"
                  >
                    비밀번호 찾기
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 bg-[#cba967] text-black font-medium rounded-lg hover:bg-[#b99a58] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cba967] transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    "로그인"
                  )}
                </button>
              </form>
              
              {/* 구분선 */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[rgba(255,255,255,0.1)]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-[#050a16] text-sm text-[#C7C7CC]">또는</span>
                </div>
              </div>
              
              {/* 소셜 로그인 버튼 */}
              <div className="space-y-3">
                <button 
                  type="button"
                  onClick={() => {
                    setError(null);
                    // TODO: 구글 로그인 구현
                    alert("구글 로그인은 현재 개발 중입니다.");
                  }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-white rounded-lg hover:bg-gray-100 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-3">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-900">구글 계정으로 로그인</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => {
                    setError(null);
                    // TODO: 애플 로그인 구현
                    alert("애플 로그인은 현재 개발 중입니다.");
                  }}
                  className="w-full flex items-center justify-center py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[#131f36] transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-3 fill-current text-white">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/>
                  </svg>
                  <span className="text-sm font-medium text-white">애플 계정으로 로그인</span>
                </button>
              </div>
              
              {/* 회원가입 링크 */}
              <div className="mt-6 text-center text-sm">
                <span className="text-[#C7C7CC]">계정이 없으신가요?</span>{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('register');
                  }}
                  className="text-[#cba967] hover:text-[#b99a58] font-medium"
                >
                  회원가입
                </button>
              </div>
            </>
          )}
          
          {/* 회원가입 폼 */}
          {mode === 'register' && !success && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* 이름 필드 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#C7C7CC] mb-1">
                    이름 <span className="text-[#cba967]">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={registerForm.firstName}
                    onChange={handleRegisterChange}
                    required
                    className={`w-full py-3 px-4 bg-[#0d1526] border ${formErrors.firstName ? 'border-[#ED5757]' : 'border-[rgba(255,255,255,0.1)]'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-[#ED5757]">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#C7C7CC] mb-1">
                    성 <span className="text-[#cba967]">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={registerForm.lastName}
                    onChange={handleRegisterChange}
                    required
                    className={`w-full py-3 px-4 bg-[#0d1526] border ${formErrors.lastName ? 'border-[#ED5757]' : 'border-[rgba(255,255,255,0.1)]'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-[#ED5757]">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              {/* 이메일 필드 */}
              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium text-[#C7C7CC] mb-1">
                  이메일 <span className="text-[#cba967]">*</span>
                </label>
                <input
                  id="registerEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  required
                  className={`w-full py-3 px-4 bg-[#0d1526] border ${formErrors.email ? 'border-[#ED5757]' : 'border-[rgba(255,255,255,0.1)]'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-[#ED5757]">{formErrors.email}</p>
                )}
              </div>
              
              {/* 비밀번호 필드 */}
              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-[#C7C7CC] mb-1">
                  비밀번호 <span className="text-[#cba967]">*</span>
                </label>
                <input
                  id="registerPassword"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                  className={`w-full py-3 px-4 bg-[#0d1526] border ${formErrors.password ? 'border-[#ED5757]' : 'border-[rgba(255,255,255,0.1)]'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent`}
                />
                {formErrors.password ? (
                  <p className="mt-1 text-xs text-[#ED5757]">{formErrors.password}</p>
                ) : (
                  <p className="mt-1 text-xs text-[#C7C7CC]">
                    비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다.
                  </p>
                )}
              </div>
              
              {/* 비밀번호 확인 필드 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#C7C7CC] mb-1">
                  비밀번호 확인 <span className="text-[#cba967]">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  className={`w-full py-3 px-4 bg-[#0d1526] border ${formErrors.confirmPassword ? 'border-[#ED5757]' : 'border-[rgba(255,255,255,0.1)]'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent`}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-[#ED5757]">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              {/* 서비스 이용약관 동의 */}
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={registerForm.terms}
                  onChange={handleRegisterChange}
                  required
                  className="h-4 w-4 text-[#cba967] focus:ring-[#cba967] border-gray-700 rounded bg-[#0d1526] mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-[#C7C7CC]">
                  <span>브릿지메이커스의 </span>
                  <Link href={`/${locale}/terms`} className="text-[#cba967] hover:text-[#b99a58]">
                    서비스 이용약관
                  </Link>
                  <span>과 </span>
                  <Link href={`/${locale}/privacy`} className="text-[#cba967] hover:text-[#b99a58]">
                    개인정보 처리방침
                  </Link>
                  <span>에 동의합니다</span> <span className="text-[#cba967]">*</span>
                </label>
              </div>
              
              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-[#cba967] text-black font-medium rounded-lg hover:bg-[#b99a58] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cba967] transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리 중...
                  </span>
                ) : (
                  "회원가입"
                )}
              </button>
              
              {/* 로그인 링크 */}
              <div className="text-center text-sm">
                <span className="text-[#C7C7CC]">이미 계정이 있으신가요?</span>{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="text-[#cba967] hover:text-[#b99a58] font-medium"
                >
                  로그인
                </button>
              </div>
            </form>
          )}
          
          {/* 비밀번호 찾기 폼 */}
          {mode === 'forgot' && !success && (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-[#C7C7CC] mb-1">
                  이메일
                </label>
                <input
                  id="forgotEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                  placeholder="가입시 사용한 이메일 주소를 입력하세요"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-[#cba967] text-black font-medium rounded-lg hover:bg-[#b99a58] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#cba967] transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리 중...
                  </span>
                ) : (
                  "재설정 링크 보내기"
                )}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="text-sm text-[#cba967] hover:underline"
                >
                  로그인 페이지로 돌아가기
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 