"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/components/auth/AuthProvider';
import { signIn, signUp, signOut, getCurrentUser, signInWithOAuth } from '@/lib/auth';
import { UserLevel } from '@/lib/supabase';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  run: () => Promise<void>;
}

interface TestCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default function TestAuthPage() {
  const { session, userProfile, loading } = useAuth();
  const [credentials, setCredentials] = useState<TestCredentials>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showSignupFields, setShowSignupFields] = useState(false);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, {
      ...result,
      message: `[${new Date().toLocaleTimeString()}] ${result.message}`
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
    setError(null);
  };

  // 개별 테스트 케이스 정의
  const testCases: TestCase[] = [
    {
      id: 'signup',
      name: '회원가입 테스트',
      description: '새로운 사용자 계정을 생성합니다.',
      run: async () => {
        if (!credentials.email || !credentials.password || !credentials.firstName || !credentials.lastName) {
          throw new Error('모든 필드를 입력해주세요.');
        }
        
        addTestResult({
          success: true,
          message: '회원가입 테스트 시작...'
        });
        
        const result = await signUp(
          credentials.email,
          credentials.password,
          credentials.firstName,
          credentials.lastName
        );
        
        addTestResult({
          success: result.success,
          message: '회원가입 테스트 완료',
          data: result.message,
          error: result.error
        });

        if (!result.success && !result.error?.includes('이미 등록된')) {
          throw new Error(result.error);
        }
      }
    },
    {
      id: 'signin',
      name: '로그인 테스트',
      description: '이메일과 비밀번호로 로그인합니다.',
      run: async () => {
        if (!credentials.email || !credentials.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        addTestResult({
          success: true,
          message: '로그인 테스트 시작...'
        });
        
        const result = await signIn(credentials.email, credentials.password);
        addTestResult({
          success: result.success,
          message: '로그인 테스트 완료',
          data: result.user,
          error: result.error
        });

        if (!result.success) {
          throw new Error(result.error);
        }
      }
    },
    {
      id: 'user-info',
      name: '사용자 정보 조회',
      description: '현재 로그인한 사용자의 정보를 조회합니다.',
      run: async () => {
        addTestResult({
          success: true,
          message: '사용자 정보 조회 테스트 시작...'
        });
        
        const result = await getCurrentUser();
        addTestResult({
          success: result.success,
          message: '사용자 정보 조회 완료',
          data: result.user,
          error: result.error
        });
      }
    },
    {
      id: 'signout',
      name: '로그아웃 테스트',
      description: '현재 로그인된 사용자를 로그아웃합니다.',
      run: async () => {
        addTestResult({
          success: true,
          message: '로그아웃 테스트 시작...'
        });
        
        const result = await signOut();
        addTestResult({
          success: result.success,
          message: '로그아웃 테스트 완료',
          error: result.error
        });
      }
    },
    {
      id: 'google-oauth',
      name: 'Google 로그인',
      description: 'Google OAuth를 통해 로그인합니다.',
      run: async () => {
        addTestResult({
          success: true,
          message: 'Google OAuth 로그인 테스트 시작...'
        });
        
        const result = await signInWithOAuth('google');
        addTestResult({
          success: result.success,
          message: `Google OAuth 로그인 ${result.success ? '성공' : '실패'}`,
          data: result.data,
          error: result.error
        });
      }
    },
    {
      id: 'apple-oauth',
      name: 'Apple 로그인',
      description: 'Apple OAuth를 통해 로그인합니다.',
      run: async () => {
        addTestResult({
          success: true,
          message: 'Apple OAuth 로그인 테스트 시작...'
        });
        
        const result = await signInWithOAuth('apple');
        addTestResult({
          success: result.success,
          message: `Apple OAuth 로그인 ${result.success ? '성공' : '실패'}`,
          data: result.data,
          error: result.error
        });
      }
    }
  ];

  const runTest = async (testCase: TestCase) => {
    setIsRunningTest(true);
    setSelectedTest(testCase.id);
    setError(null);
    
    try {
      await testCase.run();
    } catch (err: any) {
      setError(err.message);
      addTestResult({
        success: false,
        message: `${testCase.name} 실패`,
        error: err.message
      });
    } finally {
      setIsRunningTest(false);
      setSelectedTest(null);
    }
  };

  const runAllTests = async () => {
    clearResults();
    setIsRunningTest(true);
    
    for (const testCase of testCases) {
      try {
        await testCase.run();
      } catch (err: any) {
        setError(err.message);
        addTestResult({
          success: false,
          message: `${testCase.name} 실패`,
          error: err.message
        });
        break;
      }
    }
    
    setIsRunningTest(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 실시간 상태 모니터링
  useEffect(() => {
    const authStatus = loading 
      ? '인증 상태 확인 중...' 
      : session 
        ? `인증됨 (${session.user.email})` 
        : '인증되지 않음';
    
    const cachedProfile = sessionStorage.getItem('userProfile');
    
    addTestResult({
      success: true,
      message: `인증 상태: ${authStatus}`,
      data: { 
        session, 
        userProfile,
        cachedProfile: cachedProfile ? JSON.parse(cachedProfile) : null
      }
    });
  }, [session, userProfile, loading]);

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">인증 시스템 테스트</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">테스트 계정 정보</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호 입력"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setShowSignupFields(!showSignupFields)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showSignupFields ? '회원가입 필드 숨기기' : '회원가입 필드 표시'}
            </button>
          </div>

          {showSignupFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={credentials.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="이름 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={credentials.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="성 입력"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">기본 인증 테스트</h2>
          </div>
          <div className="p-6 space-y-4">
            {testCases.slice(0, 4).map(testCase => (
              <div key={testCase.id} className="space-y-2">
                <button
                  onClick={() => runTest(testCase)}
                  disabled={isRunningTest}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    isRunningTest && selectedTest === testCase.id
                      ? 'bg-blue-200 cursor-not-allowed'
                      : isRunningTest
                      ? 'bg-gray-200 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors`}
                >
                  {isRunningTest && selectedTest === testCase.id ? '실행 중...' : testCase.name}
                </button>
                <p className="text-sm text-gray-600">{testCase.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">OAuth 테스트</h2>
          </div>
          <div className="p-6 space-y-4">
            {testCases.slice(4).map(testCase => (
              <div key={testCase.id} className="space-y-2">
                <button
                  onClick={() => runTest(testCase)}
                  disabled={isRunningTest}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${
                    isRunningTest && selectedTest === testCase.id
                      ? 'bg-blue-200 cursor-not-allowed'
                      : isRunningTest
                      ? 'bg-gray-200 cursor-not-allowed'
                      : testCase.id === 'google-oauth'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-black hover:bg-gray-800 text-white'
                  } transition-colors`}
                >
                  {isRunningTest && selectedTest === testCase.id ? '실행 중...' : testCase.name}
                </button>
                <p className="text-sm text-gray-600">{testCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={runAllTests}
          disabled={isRunningTest}
          className={`px-6 py-2 rounded-lg font-medium ${
            isRunningTest 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          } transition-colors`}
        >
          {isRunningTest ? '테스트 실행 중...' : '모든 테스트 실행'}
        </button>

        <button
          onClick={clearResults}
          disabled={isRunningTest}
          className={`px-6 py-2 rounded-lg font-medium ${
            isRunningTest 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          } transition-colors`}
        >
          결과 초기화
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">테스트 결과</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {testResults.map((result, index) => (
            <div key={index} className={`px-6 py-4 ${result.success ? 'bg-green-50' : result.error ? 'bg-red-50' : 'bg-blue-50'}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : result.error ? (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">{result.message}</p>
                  {result.error && (
                    <p className="mt-1 text-sm text-red-600">{result.error}</p>
                  )}
                  {result.data && (
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
          {testResults.length === 0 && (
            <div className="px-6 py-4 text-gray-500 text-center">
              테스트를 실행하면 결과가 여기에 표시됩니다.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">실시간 상태</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">로딩 상태</h3>
              <p className="mt-1 text-sm text-gray-900">{loading ? '로딩 중...' : '로딩 완료'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">세션 상태</h3>
              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">사용자 정보</h3>
              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 