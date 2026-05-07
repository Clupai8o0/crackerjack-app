import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { supabase } from '@/lib/supabase';

export function useSession() {
  const { session, user, initialized, setSession, setInitialized } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setInitialized();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, [setSession, setInitialized]);

  return { session, user, initialized };
}
