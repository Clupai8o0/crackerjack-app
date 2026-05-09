import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import type { UserRole } from '@/types/database';

type AuthState = {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  setupComplete: boolean | null;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setRole: (role: UserRole | null) => void;
  setSetupComplete: (done: boolean) => void;
  setInitialized: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  setupComplete: null,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setRole: (role) => set({ role }),
  setSetupComplete: (done) => set({ setupComplete: done }),
  setInitialized: () => set({ initialized: true }),
}));
