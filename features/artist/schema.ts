import { z } from 'zod';
import type { ArtistCategory, PriceUnit } from '@/types/database';

export const ARTIST_CATEGORIES: { value: ArtistCategory; label: string }[] = [
  { value: 'dj', label: 'DJ' },
  { value: 'fire_led_dancer', label: 'Fire / LED Dancer' },
  { value: 'magician', label: 'Magician' },
  { value: 'emcee', label: 'Emcee' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'singer_band', label: 'Singer / Band' },
  { value: 'lifestyle_painter', label: 'Lifestyle Painter' },
  { value: 'model', label: 'Model' },
  { value: 'drone_specialist', label: 'Drone Specialist' },
];

export const LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Punjabi',
  'Gujarati',
];

export const PRICE_UNITS: { value: PriceUnit; label: string }[] = [
  { value: 'per_event', label: 'Per event' },
  { value: 'per_hour', label: 'Per hour' },
  { value: 'per_day', label: 'Per day' },
];

// display_name/city are collected in the profile-basics step, not here.
export const artistDetailsSchema = z.object({
  bio: z.string().max(500, 'Max 500 characters').optional(),
  categories: z.array(z.string()).min(1, 'Pick at least one'),
  years_experience: z.number().min(0).max(50).optional(),
  languages: z.array(z.string()).optional(),
  base_price: z.number().min(0).optional(),
  price_unit: z.enum(['per_hour', 'per_event', 'per_day'] as const).optional(),
  service_radius_km: z.number().min(1).max(500).optional(),
});
export type ArtistDetailsValues = z.infer<typeof artistDetailsSchema>;

// At least one of (account_number + ifsc) or upi_id must be provided.
export const bankDetailsSchema = z
  .object({
    account_holder: z.string().min(2).max(100).optional(),
    account_number: z
      .string()
      .regex(/^\d{6,18}$/, 'Enter a valid account number')
      .optional(),
    ifsc: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC')
      .optional(),
    upi_id: z
      .string()
      .regex(/^[\w.-]+@[\w.-]+$/, 'Enter a valid UPI ID')
      .optional(),
  })
  .refine((v) => (v.account_number && v.ifsc) || v.upi_id, {
    message: 'Provide either bank account + IFSC, or UPI ID',
  });
export type BankDetailsValues = z.infer<typeof bankDetailsSchema>;

export type KycDocType = 'id_front' | 'id_back' | 'selfie';

// ─── Legacy schemas (kept for backward compat until setup screens are replaced) ──

/** @deprecated Use artistDetailsSchema + profileBasicsSchema. */
export const artistSetupSchema = artistDetailsSchema.extend({
  display_name: z.string().min(2, 'At least 2 characters').max(50),
  city: z.string().min(2, 'At least 2 characters').optional(),
});
/** @deprecated */
export type ArtistSetupValues = z.infer<typeof artistSetupSchema>;

/** @deprecated Use profileBasicsSchema. */
export const organizerSetupSchema = z.object({
  display_name: z.string().min(2, 'At least 2 characters').max(50),
  city: z.string().min(2, 'Enter your city').max(100),
});
/** @deprecated */
export type OrganizerSetupValues = z.infer<typeof organizerSetupSchema>;
