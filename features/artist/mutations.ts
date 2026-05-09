import { useMutation, useQueryClient } from '@tanstack/react-query';
import { captureException } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { ArtistCategory } from '@/types/database';
import type { ArtistSetupValues, OrganizerSetupValues } from './schema';

// supabase-js requires explicit cast when DB types are manually stubbed
const cast = (table: string) => supabase.from(table) as ReturnType<typeof supabase.from>;

export function useCompleteArtistSetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ArtistSetupValues) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await cast('profiles')
        .update({
          display_name: values.display_name,
          city: values.city ?? null,
          setup_complete: true,
        })
        .eq('id', user.id);

      await cast('artist_profiles').upsert({
        profile_id: user.id,
        bio: values.bio ?? null,
        years_experience: values.years_experience ?? null,
        languages: values.languages ?? null,
        base_price: values.base_price ?? null,
        price_unit: values.price_unit ?? null,
        service_radius_km: values.service_radius_km ?? null,
      });

      await cast('artist_categories').delete().eq('artist_id', user.id);

      if (values.categories.length > 0) {
        await cast('artist_categories').insert(
          values.categories.map((cat) => ({
            artist_id: user.id,
            category: cat as ArtistCategory,
          })),
        );
      }

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    },
    onError: (err) => captureException(err, { feature: 'artist_setup' }),
  });
}

export function useCompleteOrganizerSetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: OrganizerSetupValues) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await cast('profiles')
        .update({ display_name: values.display_name, city: values.city, setup_complete: true })
        .eq('id', user.id);

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    },
    onError: (err) => captureException(err, { feature: 'organizer_setup' }),
  });
}
