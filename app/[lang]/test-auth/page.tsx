"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Mail, Send, CheckCircle, XCircle } from 'lucide-react';

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

interface EmailTestForm {
  email: string;
  emailType: 'admin_notification' | 'customer_confirmation';
}

export default function TestAuthPage() {
  const { user, userProfile, isLoading, signIn, signOut, supabase } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [emailTestForm, setEmailTestForm] = useState<EmailTestForm>({
    email: '',
    emailType: 'admin_notification'
  });
  const [isEmailTesting, setIsEmailTesting] = useState(false);
  const router = useRouter();

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

  // 이메일 발송 테스트 함수
  const testEmailAPI = async () => {
    if (!emailTestForm.email.trim()) {
      addTestResult({
        success: false,
        message: '이메일 테스트 실패',
        error: '이메일 주소를 입력해주세요.'
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTestForm.email)) {
      addTestResult({
        success: false,
        message: '이메일 테스트 실패',
        error: '올바른 이메일 형식을 입력해주세요.'
      });
      return;
    }

    setIsEmailTesting(true);
    addTestResult({
      success: true,
      message: `이메일 발송 테스트 시작... (Email: ${emailTestForm.email}, Type: ${emailTestForm.emailType})`
    });

    try {
      const response = await fetch('/api/send-inquiry-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailTestForm.email,
          emailType: emailTestForm.emailType
        })
      });

      const result = await response.json();

      if (response.ok) {
        addTestResult({
          success: true,
          message: '이메일 발송 테스트 성공',
          data: result
        });
      } else {
        addTestResult({
          success: false,
          message: '이메일 발송 테스트 실패',
          error: result.message || '알 수 없는 오류'
        });
      }
    } catch (error: any) {
      addTestResult({
        success: false,
        message: '이메일 발송 테스트 실패',
        error: error.message
      });
    } finally {
      setIsEmailTesting(false);
    }
  };

  // 개별 테스트 케이스 정의
  const testCases: TestCase[] = [
    {
      id: 'user-info',
      name: '사용자 정보 조회',
      description: '현재 로그인한 사용자의 정보를 조회합니다.',
      run: async () => {
        addTestResult({
          success: true,
          message: '사용자 정보 조회 테스트 시작...'
        });
        
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error) throw error;
          
        addTestResult({
          success: true,
            message: '사용자 정보 조회 완료',
            data: user
        });
        } catch (error: any) {
        addTestResult({
            success: false,
            message: '사용자 정보 조회 실패',
            error: error.message
        });
          throw error;
        }
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
        
        try {
          await signIn('google');
          addTestResult({
            success: true,
            message: 'Google OAuth 로그인 시작됨 (리디렉션 대기 중...)'
          });
        } catch (error: any) {
        addTestResult({
            success: false,
            message: 'Google OAuth 로그인 실패',
            error: error.message
        });
          throw error;
        }
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
        
        try {
          await signOut();
          addTestResult({
            success: true,
            message: '로그아웃 테스트 완료'
          });
        } catch (error: any) {
        addTestResult({
            success: false,
            message: '로그아웃 실패',
            error: error.message
        });
          throw error;
        }
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

  // 실시간 상태 모니터링
  useEffect(() => {
    const authStatus = isLoading 
      ? '인증 상태 확인 중...' 
      : user 
        ? `인증됨 (${user.email})` 
        : '인증되지 않음';
    
    const profileStatus = isLoading
      ? '프로필 로딩 중...'
      : userProfile
        ? `프로필 로드됨 (${userProfile.first_name || ''} ${userProfile.last_name || ''})`
        : '프로필 없음';
    
    addTestResult({
      success: true,
      message: `상태 업데이트: ${authStatus}, ${profileStatus}`
    });
  }, [user, userProfile, isLoading]);

  return (
    <div className="min-h-screen bg-[#0c1526] text-white">
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">🧪 시스템 테스트 대시보드</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 현재 상태 */}
          <div className="bg-[#152030] p-6 rounded-xl border border-[#243142]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              현재 상태
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-[#1a2332] rounded-lg border border-[#243142]">
                <p><strong className="text-[#cba967]">인증 상태:</strong> 
                  <span className={`ml-2 ${user ? 'text-green-400' : 'text-red-400'}`}>
                    {isLoading ? '로딩 중...' : user ? '인증됨' : '인증되지 않음'}
                  </span>
                </p>
                {user && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p><strong className="text-[#cba967]">이메일:</strong> {user.email}</p>
                    <p><strong className="text-[#cba967]">ID:</strong> <code className="bg-[#0c1526] px-2 py-1 rounded text-xs">{user.id}</code></p>
                  </div>
                )}
                {userProfile && (
                  <div className="mt-3 pt-3 border-t border-[#243142] space-y-1 text-sm">
                    <p><strong className="text-[#cba967]">이름:</strong> {userProfile.first_name || ''} {userProfile.last_name || ''}</p>
                    <p><strong className="text-[#cba967]">역할:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        userProfile.user_level === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                        {userProfile.user_level}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 인증 테스트 */}
          <div className="bg-[#152030] p-6 rounded-xl border border-[#243142]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🔐 인증 테스트
            </h2>
            <div className="space-y-3">
              {testCases.map(test => (
                <div key={test.id} className="p-4 bg-[#1a2332] rounded-lg border border-[#243142]">
                  <h3 className="font-medium text-[#cba967]">{test.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{test.description}</p>
                  <button
                    onClick={() => runTest(test)}
                    disabled={isRunningTest}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isRunningTest && selectedTest === test.id
                        ? 'bg-blue-600 text-white cursor-not-allowed'
                        : 'bg-[#cba967] text-white hover:bg-[#b99a58]'
                    }`}
                  >
                    {isRunningTest && selectedTest === test.id ? '실행 중...' : '테스트 실행'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 이메일 API 테스트 */}
          <div className="bg-[#152030] p-6 rounded-xl border border-[#243142]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-[#cba967]" />
              이메일 API 테스트
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 주소 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={emailTestForm.email}
                  onChange={(e) => setEmailTestForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-[#1a2332] border border-[#243142] rounded-lg text-white placeholder-gray-500 focus:border-[#cba967] focus:outline-none transition-colors"
                  placeholder="이메일 주소를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일 타입
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'admin_notification', label: '관리자 알림' },
                    { value: 'customer_confirmation', label: '고객 확인' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="emailType"
                        value={option.value}
                        checked={emailTestForm.emailType === option.value}
                        onChange={(e) => setEmailTestForm(prev => ({ 
                          ...prev, 
                          emailType: e.target.value as 'admin_notification' | 'customer_confirmation'
                        }))}
                        className="w-4 h-4 text-[#cba967] bg-[#1a2332] border-[#243142] focus:ring-[#cba967] focus:ring-2"
                      />
                      <span className="text-sm text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={testEmailAPI}
                disabled={isEmailTesting || !emailTestForm.email.trim()}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isEmailTesting || !emailTestForm.email.trim()
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[#cba967] text-white hover:bg-[#b99a58]'
                }`}
              >
                {isEmailTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    이메일 발송 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    이메일 발송 테스트
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 테스트 결과 */}
        <div className="mt-8 bg-[#152030] p-6 rounded-xl border border-[#243142]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              📊 테스트 결과
            </h2>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-[#243142] text-gray-300 rounded-lg hover:bg-[#2a3645] transition-colors"
            >
              결과 지우기
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg flex items-center">
              <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <strong>오류:</strong> {error}
              </div>
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto p-4 bg-[#1a2332] rounded-lg border border-[#243142]">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">아직 테스트 결과가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-900/30 border-green-700 text-green-300' 
                        : 'bg-red-900/30 border-red-700 text-red-300'
                    }`}
                  >
                    <div className="flex items-start">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{result.message}</p>
                        {result.error && (
                          <p className="mt-1 text-xs opacity-90">
                            <strong>오류:</strong> {result.error}
                          </p>
                        )}
                        {result.data && (
                          <pre className="mt-2 p-2 bg-[#0c1526] rounded overflow-x-auto text-xs border border-[#243142]">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#243142] text-gray-300 rounded-lg hover:bg-[#2a3645] transition-colors"
          >
            🏠 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
} 