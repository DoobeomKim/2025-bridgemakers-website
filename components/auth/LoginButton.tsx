'use client';

import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function LoginButton() {
  const { user, signIn, signOut, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signIn('google');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsAuthenticating(true);
      await signOut();
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return <Button disabled className="text-sm">로딩 중...</Button>;
  }

  return user ? (
    <Button 
      onClick={handleSignOut}
      disabled={isAuthenticating}
      className="bg-red-500 hover:bg-red-600 text-white text-sm"
    >
      {isAuthenticating ? '로그아웃 중...' : '로그아웃'}
    </Button>
  ) : (
    <Button 
      onClick={handleSignIn}
      disabled={isAuthenticating}
      className="text-sm"
    >
      Google로 로그인
    </Button>
  );
} 