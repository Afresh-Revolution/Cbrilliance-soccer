import { z } from 'zod';

export const academyApplicationSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']),
  height: z.string().optional(),
  preferredFoot: z.enum(['left', 'right', 'both']).optional(),
  parentGuardianName: z.string().min(2, 'Parent/guardian name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(6, 'Phone number is required'),
  previousClub: z.string().optional(),
});

export const scoutInquirySchema = z.object({
  scoutName: z.string().min(2, 'Name is required'),
  clubName: z.string().min(2, 'Club name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  playerId: z.string().optional(),
});

export const contactInquirySchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  organization: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const playerSchema = z.object({
  fullName: z.string().min(2),
  slug: z.string().min(2),
  dateOfBirth: z.string(),
  nationality: z.string().min(2),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']),
  height: z.string().optional(),
  weight: z.string().optional(),
  preferredFoot: z.enum(['left', 'right', 'both']).optional(),
  biography: z.string().optional(),
  status: z.string(),
  academyGraduate: z.boolean().optional(),
  professionalPlayer: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateCredentialsSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newEmail: z.string().email('Valid email is required').optional(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[0-9]/, 'Password must include a number')
    .optional(),
}).refine((data) => data.newEmail || data.newPassword, {
  message: 'Provide a new email or new password',
});

export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(3).max(100),
  folder: z.string().max(40).optional(),
  fileSize: z.number().int().positive().max(10 * 1024 * 1024).optional(),
});

export const playersQuerySchema = z.object({
  search: z.string().max(100).optional(),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']).optional(),
  status: z.string().max(50).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

export const videosQuerySchema = z.object({
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']).optional(),
  ageCategory: z.string().max(20).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

export const newsArticleSchema = z.object({
  title: z.string().min(5),
  slug: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});
