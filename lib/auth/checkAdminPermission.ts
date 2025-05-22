import { SupabaseClient } from '@supabase/supabase-js';

export async function checkAdminPermission(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_level')
      .eq('user_id', user.id)
      .single();

    return userProfile?.user_level === 'ADMIN';
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
} 