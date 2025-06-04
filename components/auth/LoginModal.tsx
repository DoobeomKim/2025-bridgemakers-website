"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from '@/components/auth/AuthContext';
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

const LoginModal = ({ isOpen, onClose, locale, initialMode = 'login' }: LoginModalProps) => {
  const { signInWithEmail: signIn, signUpWithEmail: signUp, resetPassword } = useAuth();
  const messages = useMessages();
  
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
  const [formErrors, setFormErrors] = useState<FormErrors>({
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
  const { session } = useAuth();

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
      // 이벤트가 모달 컨테이너에서 시작된 경우에만 처리
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    if (isOpen) {
      // mousedown 대신 click 이벤트 사용
      document.addEventListener("click", handleClickOutside);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
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
  
  // 로그인 상태가 변경되면 모달 닫기
  useEffect(() => {
    if (session) {
      onClose();
    }
  }, [session, onClose]);

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

  // 회원가입 폼 유효성 검증
  const validateRegisterForm = (): boolean => {
    const errors: FormErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      terms: ""
    };
    
    if (!registerForm.email) {
      errors.email = messages.auth.login.modal.emailError;
    } else if (!validateEmail(registerForm.email)) {
      errors.email = messages.auth.login.modal.emailInvalid;
    }
    
    if (!registerForm.password) {
      errors.password = messages.auth.login.modal.passwordError;
    } else if (!validatePassword(registerForm.password)) {
      errors.password = messages.auth.login.modal.passwordInvalid;
    }
    
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = messages.auth.login.register.confirmPasswordError;
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = messages.auth.login.register.confirmPasswordMismatch;
    }
    
    if (!registerForm.firstName) {
      errors.firstName = messages.auth.login.register.firstNameError;
    }
    
    if (!registerForm.lastName) {
      errors.lastName = messages.auth.login.register.lastNameError;
    }
    
    if (!registerForm.terms) {
      errors.terms = messages.auth.login.register.termsError;
    }
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  // 로그인 폼 유효성 검증
  const validateLoginForm = (): boolean => {
    const errors: FormErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: ""
    };
    
    if (!email) {
      errors.email = messages.auth.login.modal.emailError;
    } else if (!validateEmail(email)) {
      errors.email = messages.auth.login.modal.emailInvalid;
    }
    
    if (!password) {
      errors.password = messages.auth.login.modal.passwordError;
    }
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(email, password);
        onClose();
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error);
      setError(messages.auth.login.modal.error);
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 처리
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(
        registerForm.email,
        registerForm.password,
        registerForm.firstName,
        registerForm.lastName
      );
      setSuccess(messages.auth.login.register.success);
      setTimeout(() => {
        setMode('login');
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
      setError(messages.auth.login.register.error);
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 처리
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setFormErrors({
        ...formErrors,
        email: messages.auth.login.modal.emailError
      });
      return;
    }
    
    if (!validateEmail(email)) {
      setFormErrors({
        ...formErrors,
        email: messages.auth.login.modal.emailInvalid
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setSuccess(messages.auth.login.forgot.success);
      setTimeout(() => {
        setMode('login');
        setSuccess(null);
      }, 3000);
    } catch (error: any) {
      console.error('❌ 비밀번호 재설정 실패:', error);
      setError(messages.auth.login.forgot.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl"
      >
          <button 
            onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
          <XMarkIcon className="w-6 h-6" />
          </button>
          
          {/* 로그인 폼 */}
        {mode === 'login' && (
                <div>
            <h2 className="text-2xl font-bold mb-6">{messages.auth.login.modal.title}</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {messages.auth.login.modal.emailLabel}
                </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  placeholder={messages.auth.login.modal.emailPlaceholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
                </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {messages.auth.login.modal.passwordLabel}
                </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  placeholder={messages.auth.login.modal.passwordPlaceholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
                </div>
                
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
                  {error}
                </div>
              )}
                
                <button
                  type="submit"
                  disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                {isLoading ? messages.auth.login.authenticating : messages.auth.login.modal.submitButton}
                </button>
                
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {messages.auth.login.modal.registerLink}
                </button>
              </div>
              
              <div className="mt-2 text-center">
                <button 
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  {messages.auth.login.modal.forgotLink}
                </button>
              </div>
            </form>
          </div>
          )}
          
          {/* 회원가입 폼 */}
        {mode === 'register' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">{messages.auth.login.register.title}</h2>
            <form onSubmit={handleRegister}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {messages.auth.login.register.firstNameLabel}
                  </label>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, firstName: e.target.value })
                    }
                    placeholder={messages.auth.login.register.firstNamePlaceholder}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    {messages.auth.login.register.lastNameLabel}
                  </label>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, lastName: e.target.value })
                    }
                    placeholder={messages.auth.login.register.lastNamePlaceholder}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {messages.auth.login.modal.emailLabel}
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  placeholder={messages.auth.login.modal.emailPlaceholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {messages.auth.login.modal.passwordLabel}
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  placeholder={messages.auth.login.modal.passwordPlaceholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {messages.auth.login.register.confirmPasswordLabel}
                </label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder={messages.auth.login.register.confirmPasswordPlaceholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={registerForm.terms}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, terms: e.target.checked })
                    }
                    className="mr-2"
                />
                  <span className="text-sm text-gray-700">
                    {messages.auth.login.register.termsLabel}
                  </span>
                </label>
                {formErrors.terms && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.terms}</p>
                )}
              </div>
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? messages.auth.login.authenticating : messages.auth.login.register.submitButton}
              </button>
              
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {messages.auth.login.register.loginLink}
                </button>
              </div>
            </form>
          </div>
          )}
          
        {/* 비밀번호 재설정 폼 */}
        {mode === 'forgot' && (
              <div>
            <h2 className="text-2xl font-bold mb-2">{messages.auth.login.forgot.title}</h2>
            <p className="text-gray-600 mb-6">{messages.auth.login.forgot.description}</p>
            <form onSubmit={handlePasswordReset}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {messages.auth.login.modal.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={messages.auth.login.modal.emailPlaceholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">
                  {success}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? messages.auth.login.authenticating : messages.auth.login.forgot.submitButton}
              </button>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {messages.auth.login.forgot.loginLink}
                </button>
              </div>
            </form>
          </div>
          )}
      </div>
    </div>
  );
};

export default LoginModal; 