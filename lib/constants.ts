export const ARTIST_CATEGORIES = [
  { value: 'dj', label: 'DJ' },
  { value: 'fire_led_dancer', label: 'Fire & LED Dancer' },
  { value: 'magician', label: 'Magician' },
  { value: 'emcee', label: 'Emcee' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'singer_band', label: 'Singer / Band' },
  { value: 'lifestyle_painter', label: 'Lifestyle Painter' },
  { value: 'model', label: 'Model' },
  { value: 'drone_specialist', label: 'Drone Specialist' },
] as const;

export const PRICE_UNITS = [
  { value: 'per_event', label: 'per event' },
  { value: 'per_hour', label: 'per hour' },
  { value: 'per_day', label: 'per day' },
] as const;

export const BOOKING_STATUS_LABELS = {
  requested: 'Pending',
  countered: 'Counter offer',
  accepted: 'Accepted',
  declined: 'Declined',
  paid: 'Paid',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
} as const;

export const MAX_PORTFOLIO_ITEMS = 10;
export const MAX_VIDEO_SIZE_MB = 50;
export const MAX_IMAGE_DIMENSION = 2000;
export const PLATFORM_FEE_PERCENT = 10;
