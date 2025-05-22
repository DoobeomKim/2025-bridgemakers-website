"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useRouter } from 'next/navigation';

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

export default function TestAuthPage() {
  const { user, userProfile, isLoading, signIn, signOut, supabase } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">인증 시스템 테스트</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-2">현재 상태</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded border">
              <p><strong>인증 상태:</strong> {isLoading ? '로딩 중...' : user ? '인증됨' : '인증되지 않음'}</p>
              {user && (
                <div className="mt-2">
                  <p><strong>이메일:</strong> {user.email}</p>
                  <p><strong>ID:</strong> {user.id}</p>
            </div>
              )}
              {userProfile && (
                <div className="mt-2 pt-2 border-t">
                  <p><strong>이름:</strong> {userProfile.first_name || ''} {userProfile.last_name || ''}</p>
                  <p><strong>역할:</strong> {userProfile.user_level}</p>
            </div>
          )}
        </div>
      </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">테스트 실행</h2>
            <div className="space-y-3">
              {testCases.map(test => (
                <div key={test.id} className="p-3 bg-gray-50 rounded border">
                  <h3 className="font-medium">{test.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                <button
                    onClick={() => runTest(test)}
                  disabled={isRunningTest}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      isRunningTest && selectedTest === test.id
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    {isRunningTest && selectedTest === test.id ? '실행 중...' : '테스트 실행'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">테스트 결과</h2>
        <button
          onClick={clearResults}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
        >
              결과 지우기
        </button>
      </div>

      {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              <strong>오류:</strong> {error}
        </div>
      )}

          <div className="max-h-[500px] overflow-y-auto p-3 bg-gray-50 rounded border">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">아직 테스트 결과가 없습니다.</p>
            ) : (
              <div className="space-y-2">
          {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-sm ${
                      result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </p>
                    {result.error && <p className="mt-1 text-red-700">오류: {result.error}</p>}
                  {result.data && (
                      <pre className="mt-1 p-1 bg-gray-100 rounded overflow-x-auto text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
                ))}
              </div>
            )}
            </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
} 