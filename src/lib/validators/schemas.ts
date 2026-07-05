import { z } from 'zod';
import {
  optionalSafeMediaUrlSchema,
  safeMediaUrlSchema,
  safeVideoUrlSchema,
} from '@/lib/validators/media-urls';

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
  playerId: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.string().uuid().optional(),
  ),
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

export const playersQuerySchema = z.object({
  search: z.string().max(100).optional(),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']).optional(),
  status: z.string().max(50).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

const playerStatusEnum = z.enum([
  'available_for_trials',
  'on_trial',
  'abroad',
  'in_development',
  'professional_squad',
  'in_camp',
]);

export const adminPlayerStatisticsSchema = z.object({
  matchesPlayed: z.coerce.number().int().min(0).default(0),
  goals: z.coerce.number().int().min(0).default(0),
  assists: z.coerce.number().int().min(0).default(0),
  cleanSheets: z.coerce.number().int().min(0).default(0),
  minutesPlayed: z.coerce.number().int().min(0).default(0),
});

export const adminPlayerSchema = z.object({
  fullName: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional(),
  profilePhoto: optionalSafeMediaUrlSchema,
  dateOfBirth: z.string().min(1),
  nationality: z.string().min(2).max(80),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  preferredFoot: z.enum(['left', 'right', 'both']).optional(),
  biography: z.string().max(8000).optional(),
  status: playerStatusEnum,
  academyGraduate: z.boolean().optional(),
  professionalPlayer: z.boolean().optional(),
  featured: z.boolean().optional(),
  jerseyNumber: z.coerce.number().int().min(1).max(99).nullable().optional(),
  statistics: adminPlayerStatisticsSchema.optional(),
});

export const adminPlayerPatchSchema = adminPlayerSchema.partial();
export const adminPlayerStatusSchema = z.object({ status: playerStatusEnum });

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

const newsCategoryEnum = z.enum([
  'academy_news',
  'player_updates',
  'trial_news',
  'club_news',
  'international_opportunities',
  'agency_announcements',
]);

export const adminNewsArticleSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(2).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().max(50000).optional(),
  category: newsCategoryEnum,
  coverImage: optionalSafeMediaUrlSchema,
  author: z.string().max(120).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export const adminNewsPatchSchema = adminNewsArticleSchema.partial();

const ageCategoryEnum = z.enum(['U10', 'U13', 'U15', 'U17', 'U19', 'Senior']);
const videoPositionEnum = z.enum(['goalkeeper', 'defender', 'midfielder', 'forward', 'all']);

export const adminVideoSchema = z.object({
  title: z.string().min(2).max(200),
  thumbnail: optionalSafeMediaUrlSchema,
  videoUrl: safeVideoUrlSchema,
  playerId: z.string().uuid().nullable().optional(),
  playerName: z.string().max(120).optional(),
  position: videoPositionEnum.optional(),
  ageCategory: ageCategoryEnum.optional(),
  duration: z.string().max(10).optional(),
  featured: z.boolean().optional(),
});

export const adminVideoPatchSchema = adminVideoSchema.partial();

const applicationStatusEnum = z.enum([
  'new',
  'pending',
  'contacted',
  'closed',
  'reviewed',
  'invited',
  'rejected',
]);

export const adminApplicationStatusSchema = z.object({
  status: applicationStatusEnum,
});

const inquiryStatusEnum = z.enum(['new', 'pending', 'contacted', 'closed']);

export const adminInquiryStatusSchema = z.object({
  status: inquiryStatusEnum,
});

export const adminStaffSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  photo: optionalSafeMediaUrlSchema,
  bio: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const adminStaffPatchSchema = adminStaffSchema.partial();

export const adminGallerySchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  imageUrl: safeMediaUrlSchema,
  category: z.string().max(50).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const adminGalleryPatchSchema = adminGallerySchema.partial();

const activityTypeEnum = z.enum(['trial', 'achievement', 'camp', 'club', 'agency']);

export const adminActivitySchema = z.object({
  type: activityTypeEnum,
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  activityDate: z.string().min(1),
  playerId: z.string().uuid().nullable().optional(),
});

export const adminActivityPatchSchema = adminActivitySchema.partial();

export const adminFixtureSchema = z.object({
  homeTeam: z.string().min(2).max(120),
  awayTeam: z.string().min(2).max(120),
  homeScore: z.coerce.number().int().min(0).nullable().optional(),
  awayScore: z.coerce.number().int().min(0).nullable().optional(),
  matchDate: z.string().min(1),
  venue: z.string().max(120).optional(),
  competition: z.string().max(120).optional(),
  isUpcoming: z.boolean().optional(),
});

export const adminFixturePatchSchema = adminFixtureSchema.partial();

export const adminAcademyFacilitySchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  imageUrl: safeMediaUrlSchema,
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const adminAcademyFacilityPatchSchema = adminAcademyFacilitySchema.partial();

export const adminAcademyFacilitySettingsSchema = z.object({
  sectionLabel: z.string().min(1).max(80),
  sectionHeading: z.string().min(1).max(200),
});

export const auditLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});