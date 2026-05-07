import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import type { UserRole } from '@/types/database';

type AuthState = {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole | null) => void;
  setInitialized: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setRole: (role) => set({ role }),
  setInitialized: () => set({ initialized: true }),
}));
