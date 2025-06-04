'use client';

import { useAuth } from './AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';

export function LoginButton() {
  const { user, signIn, signOut, isLoading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const messages = useMessages();

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signIn('google');
    } catch (error) {
      console.error(messages.auth.login.error, error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsAuthenticating(true);
      await signOut();
    } catch (error) {
      console.error(messages.auth.logout.error, error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return <Button disabled className="text-sm">{messages.auth.login.loading}</Button>;
  }

  return user ? (
    <Button 
      onClick={handleSignOut}
      disabled={isAuthenticating}
      className="bg-red-500 hover:bg-red-600 text-white text-sm"
    >
      {isAuthenticating ? messages.auth.logout.authenticating : messages.auth.logout.button}
    </Button>
  ) : (
    <Button 
      onClick={handleSignIn}
      disabled={isAuthenticating}
      className="text-sm"
    >
      {isAuthenticating ? messages.auth.login.authenticating : messages.auth.login.google}
    </Button>
  );
} 