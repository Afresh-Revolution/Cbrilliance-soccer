export type PlayerStatus =
  | 'available_for_trials'
  | 'on_trial'
  | 'abroad'
  | 'in_development'
  | 'professional_squad'
  | 'in_camp';

export type PlayerPosition =
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward';

export type PreferredFoot = 'left' | 'right' | 'both';

export type InquiryStatus = 'new' | 'pending' | 'contacted' | 'closed';

export type ApplicationStatus =
  | 'new'
  | 'pending'
  | 'contacted'
  | 'closed'
  | 'reviewed'
  | 'invited'
  | 'rejected';

export type TournamentOfficialPosition =
  | 'team_manager'
  | 'coach'
  | 'team_representative'
  | 'club_official';

export type TournamentRegistrationStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type UserRole = 'super_admin' | 'content_admin' | 'academy_staff';

export type NewsCategory =
  | 'academy_news'
  | 'player_updates'
  | 'trial_news'
  | 'club_news'
  | 'international_opportunities'
  | 'agency_announcements';

export type AgeCategory = 'U10' | 'U13' | 'U15' | 'U17' | 'U19' | 'Senior';

export interface PlayerStrengths {
  pace: number;
  vision: number;
  passing: number;
  dribbling: number;
  finishing: number;
  tackling: number;
  leadership: number;
  strength: number;
}

export interface PlayerStatistics {
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  minutesPlayed: number;
}

export interface PlayerAchievement {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'award' | 'tournament' | 'recognition' | 'milestone';
}

export interface PreviousClub {
  id: string;
  name: string;
  period: string;
  role?: string;
}

export interface MovementRecord {
  id: string;
  type:
    | 'academy_entry'
    | 'camp_participation'
    | 'agency_representation'
    | 'trial'
    | 'professional_team'
    | 'international_opportunity';
  title: string;
  description?: string;
  date: string;
  location?: string;
}

export interface Player {
  id: string;
  fullName: string;
  slug: string;
  profilePhoto: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  position: PlayerPosition;
  height: string;
  weight: string;
  preferredFoot: PreferredFoot;
  biography: string;
  strengths: PlayerStrengths;
  statistics: PlayerStatistics;
  achievements: PlayerAchievement[];
  previousClubs: PreviousClub[];
  videos: string[];
  images: string[];
  movementHistory: MovementRecord[];
  status: PlayerStatus;
  academyGraduate: boolean;
  professionalPlayer: boolean;
  jerseyNumber?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademyApplication {
  id: string;
  fullName: string;
  dateOfBirth: string;
  position: PlayerPosition;
  height: string;
  preferredFoot: PreferredFoot;
  parentGuardianName: string;
  email: string;
  phone: string;
  previousClub?: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ScoutInquiry {
  id: string;
  scoutName: string;
  clubName: string;
  email: string;
  phone: string;
  message: string;
  playerId?: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  organization?: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  coverImage: string;
  author: string;
  published: boolean;
  featured?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  playerId?: string;
  playerName?: string;
  position?: PlayerPosition;
  ageCategory?: AgeCategory;
  duration: string;
  featured?: boolean;
  createdAt: string;
}

export interface ClubStaff {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  venue: string;
  competition: string;
  isUpcoming: boolean;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  playerId?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export type ShopCategory = 'jerseys' | 'shorts' | 'socks' | 'boots';

export interface ShopColorOption {
  name: string;
  hex: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  category: ShopCategory;
  colors: ShopColorOption[];
  sizes: string[];
  sortOrder: number;
}

export interface ShopCartItem {
  productId: string;
  productName: string;
  category: ShopCategory;
  imageUrl: string;
  color: string;
  colorHex: string;
  size: string;
  quantity: number;
}

export type ShopOrderStatus = 'new' | 'contacted' | 'completed' | 'cancelled';

export interface ShopOrderItem {
  productId: string;
  productName: string;
  category: ShopCategory;
  imageUrl: string;
  color: string;
  colorHex: string;
  size: string;
  quantity: number;
}

export interface ShopOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  items: ShopOrderItem[];
  status: ShopOrderStatus;
  createdAt: string;
}

export interface AcademyFacility {
  id: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
}

export interface AcademyFacilitiesSection {
  sectionLabel: string;
  sectionHeading: string;
  facilities: AcademyFacility[];
}

export interface AcademyFacilitySettings {
  sectionLabel: string;
  sectionHeading: string;
}

export interface SiteStats {
  registeredPlayers: number;
  academyGraduates: number;
  playersAbroad: number;
  playersOnTrial: number;
  scoutRequests: number;
  clubMatchesPlayed: number;
  professionalPlacements: number;
}

export interface ClubStats {
  matchesPlayed: number;
  wins: number;
  goalsScored: number;
  cleanSheets: number;
  playersDeveloped: number;
  leaguePosition: number;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalPlayers: number;
  activeInquiries: number;
  academyApplications: number;
  playersAbroad: number;
  publishedNews: number;
  videos: number;
  upcomingFixtures: number;
  coachingStaff: number;
  galleryImages: number;
}

export interface AdminInquiryRow {
  id: string;
  name: string;
  subtitle: string;
  status: InquiryStatus;
  source: 'scout' | 'contact';
  createdAt: string;
}

export interface AdminInquiryDetail {
  id: string;
  source: 'scout' | 'contact';
  name: string;
  organisation: string;
  typeLabel: string;
  status: InquiryStatus;
  email: string;
  phone?: string;
  message?: string;
  playerId?: string;
  createdAt: string;
}

export interface AdminApplicationRow {
  id: string;
  name: string;
  subtitle: string;
  status: ApplicationStatus;
  email: string;
  createdAt: string;
}

export interface AdminPlayerStatusRow {
  status: PlayerStatus;
  label: string;
  count: number;
}

export interface TournamentPlayer {
  id: string;
  registrationId: string;
  fullName: string;
  squadNumber: number;
  createdAt: string;
}

export interface TournamentRegistration {
  id: string;
  registrationCode: string;
  accessToken: string;
  teamName: string;
  teamShortName?: string;
  teamLocation: string;
  homeGround?: string;
  teamLogoUrl?: string;
  officialFullName: string;
  officialPhone: string;
  officialWhatsapp?: string;
  officialEmail?: string;
  officialPositions: TournamentOfficialPosition[];
  playerCount: number;
  teamCaptain?: string;
  coachName?: string;
  assistantCoach?: string;
  jerseyHome: string;
  jerseyAway?: string;
  representativeName: string;
  digitalSignature: string;
  registrationFeeAmount: number;
  paymentMethod: 'bank_transfer';
  paymentReference: string;
  paymentReceiptUrl?: string;
  status: TournamentRegistrationStatus;
  createdAt: string;
  players: TournamentPlayer[];
}

export interface TournamentBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentNote: string;
}

export interface TournamentSquad {
  registrationCode: string;
  teamName: string;
  teamShortName?: string;
  teamLocation: string;
  playerCount: number;
  status: TournamentRegistrationStatus;
  squadLocked: boolean;
  players: TournamentPlayer[];
}

export interface AdminRecentPlayer {
  id: string;
  fullName: string;
  position: string;
  status: string;
  nationality: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentInquiries: AdminInquiryRow[];
  recentApplications: AdminApplicationRow[];
  playerStatusDistribution: AdminPlayerStatusRow[];
  recentGallery: GalleryItem[];
  recentPlayers: AdminRecentPlayer[];
}



