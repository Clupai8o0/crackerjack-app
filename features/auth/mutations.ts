import { useMutation, useQueryClient } from '@tanstack/react-query';
import { track } from '@/lib/analytics';
import { addBreadcrumb, captureException } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database';
import type { SignInValues, SignUpValues } from './schema';

export function useSignIn() {
  return useMutation({
    mutationFn: async (values: SignInValues) => {
      addBreadcrumb('sign_in_attempted');
      const { data, error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      return data;
    },
    onError: (err) => captureException(err, { feature: 'auth' }),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: async (values: SignUpValues) => {
      addBreadcrumb('sign_up_attempted');
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { display_name: values.displayName } },
      });
      if (error) throw error;
      track.signupCompleted({ method: 'email' });
      return data;
    },
    onError: (err) => captureException(err, { feature: 'auth' }),
  });
}

export function useSignInWithPhone() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
    },
    onError: (err) => captureException(err, { feature: 'auth' }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ phone, token }: { phone: string; token: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw error;
      track.signupCompleted({ method: 'phone' });
      return data;
    },
    onError: (err) => captureException(err, { feature: 'auth' }),
  });
}

export function useSelectRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      // supabase-js requires explicit cast when DB types are manually stubbed
      const { error } = await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
      if (role !== 'admin') track.roleSelected({ role });
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (err) => captureException(err, { feature: 'auth' }),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
