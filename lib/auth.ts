"use client";

import { supabase } from './supabase/client';
import { UserProfile, UserLevel } from './supabase';

/**
 * 이메일과 비밀번호로 회원가입
 */
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  try {
    // 1. 이메일 중복 체크
    const { data: existingUsers, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (emailCheckError) {
      throw emailCheckError;
    }

    if (existingUsers && existingUsers.length > 0) {
      return {
        success: false,
        error: '이미 등록된 이메일 주소입니다.'
      };
    }

    // 2. 회원가입 및 이메일 발송
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email_verified: false,
          phone_verified: false
        }
      },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('회원가입 처리 중 오류가 발생했습니다.');

    // 3. users 테이블에 사용자 정보 저장
    const { error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          user_level: UserLevel.BASIC
        }
      ]);

    if (createError) throw createError;

    return {
      success: true,
      message: '회원가입이 완료되었습니다. 이메일을 확인해주세요.'
    };
  } catch (error: any) {
    console.error('회원가입 오류:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 이메일과 비밀번호로 로그인
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        company_name,
        profile_image_url,
        user_level,
        created_at,
        updated_at
      `)
      .eq('id', data.user.id)
      .single<DbUser>();

    // 사용자 정보가 없으면 새로 생성
    if (!userData) {
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            user_level: UserLevel.BASIC,
            company_name: null,
            profile_image_url: null,
          },
        ])
        .select(`
          id,
          email,
          first_name,
          last_name,
          company_name,
          profile_image_url,
          user_level,
          created_at,
          updated_at
        `)
        .single<DbUser>();

      if (createError) {
        console.error('사용자 정보 생성 오류:', createError);
        throw createError;
      }

      const userProfile: UserProfile = {
        id: newUserData.id,
        email: newUserData.email,
        first_name: newUserData.first_name,
        last_name: newUserData.last_name,
        company_name: newUserData.company_name,
        profile_image_url: newUserData.profile_image_url,
        user_level: newUserData.user_level as UserLevel,
        created_at: newUserData.created_at,
        updated_at: newUserData.updated_at
      };

      return {
        success: true,
        user: userProfile
      };
    }

    const userProfile: UserProfile = {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      company_name: userData.company_name,
      profile_image_url: userData.profile_image_url,
      user_level: userData.user_level as UserLevel,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    return { 
      success: true, 
      user: userProfile
    };
  } catch (error: any) {
    console.error('로그인 오류:', error.message);
    return { 
      success: false, 
      error: error.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : error.message 
    };
  }
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('로그아웃 오류:', error.message);
    return { success: false, error: error.message };
  }
}

interface GetCurrentUserResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    company_name?: string | null;
    profile_image_url?: string | null;
    user_level: UserLevel;
    created_at: string;
    updated_at: string;
  };
}

interface DbUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  profile_image_url: string | null;
  user_level: string;
  created_at: string;
  updated_at: string;
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return { success: false, error: '로그인이 필요합니다.' };

    // users 테이블에서 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        company_name,
        profile_image_url,
        user_level,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single<DbUser>();

    if (userError) throw userError;
    if (!userData) return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };

    // 데이터베이스 결과를 UserProfile 타입으로 변환
    const userProfile: UserProfile = {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      company_name: userData.company_name,
      profile_image_url: userData.profile_image_url,
      user_level: userData.user_level as UserLevel,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    return { 
      success: true, 
      user: userProfile
    };
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 사용자 프로필 정보 업데이트
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>
) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error: any) {
    console.error('프로필 업데이트 오류:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 사용자 프로필 이미지 업로드
 * 
 * @param userId 사용자 ID
 * @param file 업로드할 이미지 파일
 * @returns 성공 여부와 사용자 정보 또는 오류 메시지
 * 
 * 폴더 구조: 'profile-images/' 폴더에 모든 프로필 이미지가 저장됩니다.
 * 파일 이름 형식: ${userId}-${timestamp}.${fileExtension}
 * - userId: 사용자의 고유 식별자
 * - timestamp: 업로드 시점의 타임스탬프 (중복 방지)
 * - fileExtension: 원본 파일의 확장자 (jpg, png 등)
 */
export async function uploadProfileImage(userId: string, file: File) {
  try {
    // 폴더 경로 설정 - 모든 프로필 이미지는 'profile-images/' 폴더에 저장
    const folderPath = 'profile-images/';
    
    // 고유한 파일명 생성: userId-timestamp.extension
    const fileExt = file.name.split('.').pop() || 'jpg'; // 확장자가 없는 경우 기본값 지정
    const timestamp = Date.now(); // 현재 타임스탬프
    const fileName = `${userId}-${timestamp}.${fileExt}`;
    
    // 최종 파일 경로: profile-images/userId-timestamp.extension
    const filePath = `${folderPath}${fileName}`;

    console.log(`프로필 이미지 업로드 경로: ${filePath}`);

    // 이미지를 storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, {
        cacheControl: '3600', // 1시간 캐싱
        upsert: false // 같은 이름의 파일이 있으면 업로드 거부 (타임스탬프로 중복 방지)
      });

    if (uploadError) {
      console.error('이미지 업로드 오류:', uploadError);
      
      // 버킷이 없는 경우의 오류 메시지 확인
      if (uploadError.message.includes('bucket') && uploadError.message.includes('not found')) {
        return { 
          success: false, 
          error: 'user-assets 스토리지 버킷이 존재하지 않습니다. 관리자에게 문의하세요.' 
        };
      }
      
      return { 
        success: false, 
        error: `이미지 업로드 중 오류가 발생했습니다: ${uploadError.message}` 
      };
    }

    // 업로드된 이미지의 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('user-assets')
      .getPublicUrl(filePath);

    console.log(`프로필 이미지 URL: ${publicUrl}`);

    // 사용자 프로필 정보 업데이트
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ profile_image_url: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('프로필 이미지 URL 업데이트 오류:', updateError);
      return { 
        success: false, 
        error: `프로필 정보 업데이트 중 오류가 발생했습니다: ${updateError.message}` 
      };
    }
    
    return { success: true, user: data };
  } catch (error: any) {
    console.error('프로필 이미지 업로드 오류:', error.message);
    return { 
      success: false, 
      error: `이미지 업로드 중 예상치 못한 오류가 발생했습니다: ${error.message}` 
    };
  }
}

/**
 * 사용자 등급 변경 (관리자 전용)
 */
export async function changeUserLevel(userId: string, newLevel: UserLevel) {
  try {
    // 현재 사용자가 관리자인지 확인
    const currentUserResult = await getCurrentUser();
    if (!currentUserResult.success || !currentUserResult.user || currentUserResult.user.user_level !== UserLevel.ADMIN) {
      throw new Error('권한이 없습니다');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ user_level: newLevel })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error: any) {
    console.error('사용자 등급 변경 오류:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 비밀번호 재설정 이메일 발송
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('비밀번호 재설정 오류:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 새 비밀번호 설정
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('비밀번호 업데이트 오류:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * OAuth 로그인 (Google, Apple)
 */
export async function signInWithOAuth(provider: 'google' | 'apple') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('OAuth 로그인 오류:', error.message);
    return { success: false, error: error.message };
  }
} 