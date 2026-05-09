import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const phoneSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91XXXXXXXXXX)'),
});
export type PhoneValues = z.infer<typeof phoneSchema>;

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP is 6 digits'),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const roleSchema = z.object({
  role: z.enum(['artist', 'organizer', 'attendee']),
});
export type RoleValues = z.infer<typeof roleSchema>;

export const profileBasicsSchema = z.object({
  display_name: z.string().min(2, 'At least 2 characters').max(50),
  city: z.string().min(2, 'Enter your city').max(100),
  avatar_url: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
export type ProfileBasicsValues = z.infer<typeof profileBasicsSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
