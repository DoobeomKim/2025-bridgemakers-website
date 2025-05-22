export enum UserLevel {
  ADMIN = 'admin',
  BASIC = 'basic'
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string | null;
  profile_image_url?: string | null;
  user_level: UserLevel;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
} 