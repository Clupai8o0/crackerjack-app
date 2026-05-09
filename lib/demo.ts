// TEMPORARY — flip to false (or delete this file + its imports) to restore real auth.
//
// When true:
//   - The AuthGate stops auto-routing based on session/profile state.
//   - Each auth/setup screen's primary CTA short-circuits its Supabase mutation
//     and `router.push`'s straight to the next screen, so the flow plays back
//     like a slideshow without needing SMS, Supabase, or a real session.
//
// Search for `DEMO_MODE` to find every short-circuit (one block per screen).
export const DEMO_MODE = true;
