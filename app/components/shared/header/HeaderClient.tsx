'use client';

import { LoginButton } from '@/components/auth/LoginButton';
import { useAuth } from '@/components/auth/AuthContext';
import { useMessages } from '@/hooks/useMessages';

export default function HeaderClient() {
  const { userProfile, isLoading, clearBrowserData } = useAuth();
  const messages = useMessages();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Bridgemakers</h1>
        {!isLoading && userProfile && (
          <span className="text-sm text-gray-600">
            {messages.header.greeting.replace('{name}', userProfile.first_name || userProfile.email)}
          </span>
        )}
        {isLoading && (
          <span className="text-sm text-gray-400">{messages.header.loading}</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={clearBrowserData}
          className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
        >
          {messages.header.resetData}
        </button>
        <LoginButton />
      </div>
    </header>
  );
} 