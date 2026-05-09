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

export const artistSetupSchema = z.object({
  display_name: z.string().min(2, 'At least 2 characters').max(50),
  bio: z.string().max(500, 'Max 500 characters').optional(),
  categories: z.array(z.string()).min(1, 'Pick at least one'),
  years_experience: z.number().min(0).max(50).optional(),
  languages: z.array(z.string()).optional(),
  base_price: z.number().min(0).optional(),
  price_unit: z.enum(['per_hour', 'per_event', 'per_day'] as const).optional(),
  city: z.string().min(2, 'At least 2 characters').optional(),
  service_radius_km: z.number().min(1).max(500).optional(),
});

export type ArtistSetupValues = z.infer<typeof artistSetupSchema>;

export const organizerSetupSchema = z.object({
  display_name: z.string().min(2, 'At least 2 characters').max(50),
  city: z.string().min(2, 'Enter your city').max(100),
});

export type OrganizerSetupValues = z.infer<typeof organizerSetupSchema>;
