import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile(userId: string | undefined) {
  return useQuery<Profile>({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId ?? '')
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
}
