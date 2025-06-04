'use client';

import { useParams } from 'next/navigation';
import type { Messages } from '@/types/messages';

export function useMessages() {
  const params = useParams();
  const locale = params?.lang as string || 'ko';
  
  const messages = require(`@/app/[lang]/messages/${locale}`).default as Messages;
  return messages;
} 