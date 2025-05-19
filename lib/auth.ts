import { supabase, UserProfile, UserLevel } from './supabase';

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
    // 1. Supabase Auth를 사용해 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('사용자 생성 실패');

    // 2. 생성된 사용자의 프로필 정보를 users 테이블에 저장
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        profile_image_url: null,
        user_level: UserLevel.BASIC
      });

    if (profileError) throw profileError;

    return { success: true, user: authData.user };
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

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error('로그인 오류:', error.message);
    return { success: false, error: error.message };
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

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  try {
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    if (!session?.user) return { success: false, user: null };

    // 사용자 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    return { success: true, user: profile };
  } catch (error: any) {
    console.error('사용자 정보 조회 오류:', error.message);
    return { success: false, error: error.message, user: null };
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
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('비밀번호 재설정 이메일 발송 오류:', error.message);
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