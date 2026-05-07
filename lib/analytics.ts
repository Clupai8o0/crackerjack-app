import PostHog from 'posthog-react-native';

export let posthog: PostHog | null = null;

export function initAnalytics() {
  posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '', {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  });
}

type ArtistCategory =
  | 'dj'
  | 'fire_led_dancer'
  | 'magician'
  | 'emcee'
  | 'photographer'
  | 'instrumentalist'
  | 'singer_band'
  | 'lifestyle_painter'
  | 'model'
  | 'drone_specialist';

// Typed wrappers — never pass PII (email, phone, name) to PostHog.
export const track = {
  appOpened: () => posthog?.capture('app_opened'),
  screenViewed: (props: { screen: string }) => posthog?.capture('screen_viewed', props),
  signupCompleted: (props: { method: 'email' | 'phone' }) =>
    posthog?.capture('signup_completed', props),
  roleSelected: (props: { role: 'artist' | 'organizer' | 'both' }) =>
    posthog?.capture('role_selected', props),
  artistProfileCompleted: () => posthog?.capture('artist_profile_completed'),
  portfolioItemUploaded: (props: { type: 'image' | 'video' }) =>
    posthog?.capture('portfolio_item_uploaded', props),
  searchPerformed: (props: { category?: ArtistCategory; city?: string }) =>
    posthog?.capture('search_performed', props),
  bookingRequestSubmitted: (props: { artist_id: string }) =>
    posthog?.capture('booking_request_submitted', props),
  bookingAccepted: (props: { booking_id: string }) => posthog?.capture('booking_accepted', props),
  paymentInitiated: (props: { booking_id: string }) => posthog?.capture('payment_initiated', props),
  paymentSucceeded: (props: { booking_id: string }) => posthog?.capture('payment_succeeded', props),
  paymentFailed: (props: { booking_id: string }) => posthog?.capture('payment_failed', props),
  payoutReleased: (props: { booking_id: string }) => posthog?.capture('payout_released', props),
  reviewSubmitted: (props: { booking_id: string }) => posthog?.capture('review_submitted', props),
};
