import dynamic from 'next/dynamic';

const ClientAuthProvider = dynamic(
  () => import('./ClientAuthProvider'),
  { 
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100vh', background: '#000' }} />
  }
);

export const AuthProvider = ClientAuthProvider;
export { useAuth } from './ClientAuthProvider'; 