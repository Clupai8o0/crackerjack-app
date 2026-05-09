import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useArtistApplication(userId: string | undefined) {
  return useQuery({
    queryKey: ['artist-application', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('application_status, application_submitted_at, is_verified')
        .eq('profile_id', userId ?? '')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
