import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addBreadcrumb, captureException } from '@/lib/errors';
import { uploadKycFile } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { ArtistCategory } from '@/types/database';
import type {
  ArtistDetailsValues,
  ArtistSetupValues,
  BankDetailsValues,
  KycDocType,
  OrganizerSetupValues,
} from './schema';

const cast = (table: string) => supabase.from(table) as ReturnType<typeof supabase.from>;

export function useSaveArtistDetails() {
  return useMutation({
    mutationFn: async (values: ArtistDetailsValues) => {
      addBreadcrumb('save_artist_details_attempted');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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
    },
    onError: (err) => captureException(err, { feature: 'artist_details' }),
  });
}

export function useUploadKycDocument() {
  return useMutation({
    mutationFn: async ({ docType, fileUri }: { docType: KycDocType; fileUri: string }) => {
      addBreadcrumb('upload_kyc_document_attempted', { docType });
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { path } = await uploadKycFile(user.id, docType, fileUri);

      const { error } = await cast('artist_documents').upsert({
        artist_id: user.id,
        doc_type: docType,
        storage_path: path,
      });
      if (error) throw error;
    },
    onError: (err) => captureException(err, { feature: 'artist_kyc' }),
  });
}

export function useSavePayoutAccount() {
  return useMutation({
    mutationFn: async (values: BankDetailsValues) => {
      addBreadcrumb('save_payout_account_attempted');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await cast('payout_accounts').upsert({
        artist_id: user.id,
        account_holder: values.account_holder ?? null,
        account_number_encrypted: values.account_number ?? null,
        ifsc: values.ifsc ?? null,
        upi_id: values.upi_id ?? null,
      });
      if (error) throw error;
    },
    onError: (err) => captureException(err, { feature: 'payout_account' }),
  });
}

export function useSubmitArtistApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      addBreadcrumb('submit_artist_application_attempted');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: appError } = await cast('artist_profiles')
        .update({
          application_status: 'submitted',
          application_submitted_at: new Date().toISOString(),
        })
        .eq('profile_id', user.id);
      if (appError) throw appError;

      const { error: profileError } = await cast('profiles')
        .update({ setup_complete: true })
        .eq('id', user.id);
      if (profileError) throw profileError;

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['artist-application', user.id] });
    },
    onError: (err) => captureException(err, { feature: 'artist_application' }),
  });
}

export function useCompleteSetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      addBreadcrumb('complete_setup_attempted');
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await cast('profiles').update({ setup_complete: true }).eq('id', user.id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    },
    onError: (err) => captureException(err, { feature: 'setup' }),
  });
}

// ─── Legacy mutations (kept for backward compat until setup screens are replaced) ──

/** @deprecated Use useSaveArtistDetails + useUpdateProfileBasics + useSubmitArtistApplication. */
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
          values.categories.map((cat) => ({ artist_id: user.id, category: cat as ArtistCategory })),
        );
      }

      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    },
    onError: (err) => captureException(err, { feature: 'artist_setup' }),
  });
}

/** @deprecated Use useUpdateProfileBasics + useCompleteSetup. */
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
