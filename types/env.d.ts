/// <reference types="nativewind/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_SENTRY_DSN: string;
    EXPO_PUBLIC_POSTHOG_API_KEY: string;
    EXPO_PUBLIC_POSTHOG_HOST: string;
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    EXPO_PUBLIC_RAZORPAY_KEY_ID: string;
    EXPO_PUBLIC_APP_ENV: 'development' | 'preview' | 'production';
  }
}
