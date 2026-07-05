import type {
  Player,
  NewsArticle,
  Video,
  ClubStaff,
  Fixture,
  ActivityItem,
  SiteStats,
  ClubStats,
  GalleryItem,
  AcademyFacility,
  AcademyFacilitiesSection,
} from '@/types';
import { calculateAge } from '@/lib/utils/format';
import { CBFC_MEDIA } from './cbfc-media';

export const seedPlayers: Player[] = [
  {
    id: '1',
    fullName: 'Tata',
    slug: 'tata',
    profilePhoto: CBFC_MEDIA.tata.side,
    dateOfBirth: '2006-03-15',
    age: calculateAge('2006-03-15'),
    nationality: 'Nigeria',
    position: 'forward',
    height: '1.82m',
    weight: '76kg',
    preferredFoot: 'right',
    biography:
      'A dynamic forward with exceptional pace and finishing ability. Tata joined CBFC Academy at age 12 and has progressed through every stage of our development pathway. Known for clinical finishing and intelligent movement off the ball.',
    strengths: { pace: 92, vision: 78, passing: 75, dribbling: 85, finishing: 88, tackling: 45, leadership: 70, strength: 72 },
    statistics: { matchesPlayed: 48, goals: 32, assists: 12, cleanSheets: 0, minutesPlayed: 3840 },
    achievements: [
      { id: 'a1', title: 'Academy Player of the Year 2024', date: '2024-06-01', type: 'award' },
      { id: 'a2', title: 'U19 National Cup Winner', date: '2024-03-20', type: 'tournament' },
    ],
    previousClubs: [{ id: 'c1', name: 'CBFC Academy', period: '2020 - Present' }],
    videos: [],
    images: [CBFC_MEDIA.tata.action, CBFC_MEDIA.tata.action2, CBFC_MEDIA.tata.back],
    movementHistory: [
      { id: 'm1', type: 'academy_entry', title: 'Joined CBFC Academy', date: '2020-09-01', description: 'U13 intake' },
      { id: 'm2', type: 'trial', title: 'European Trial', date: '2024-11-20', location: 'Portugal' },
    ],
    status: 'on_trial',
    academyGraduate: true,
    professionalPlayer: false,
    featured: true,
    createdAt: '2020-09-01',
    updatedAt: '2025-01-15',
  },
  {
    id: '2',
    fullName: 'Chocho',
    slug: 'chocho',
    profilePhoto: CBFC_MEDIA.chocho.side,
    dateOfBirth: '2005-08-22',
    age: calculateAge('2005-08-22'),
    nationality: 'Nigeria',
    position: 'midfielder',
    height: '1.78m',
    weight: '72kg',
    preferredFoot: 'both',
    biography:
      'An elegant central midfielder with exceptional vision and passing range. Chocho controls the tempo of games and has been a standout performer in the CBFC setup.',
    strengths: { pace: 75, vision: 92, passing: 90, dribbling: 82, finishing: 70, tackling: 78, leadership: 85, strength: 74 },
    statistics: { matchesPlayed: 62, goals: 8, assists: 24, cleanSheets: 0, minutesPlayed: 5200 },
    achievements: [
      { id: 'a4', title: 'League Midfielder of the Month', date: '2024-09-01', type: 'award' },
    ],
    previousClubs: [{ id: 'c3', name: 'CBFC Academy', period: '2019 - Present' }],
    videos: [],
    images: [CBFC_MEDIA.chocho.action, CBFC_MEDIA.chocho.back],
    movementHistory: [
      { id: 'm5', type: 'academy_entry', title: 'Joined CBFC Academy', date: '2019-09-01' },
    ],
    status: 'in_development',
    academyGraduate: true,
    professionalPlayer: false,
    featured: true,
    createdAt: '2019-09-01',
    updatedAt: '2025-01-10',
  },
];

export const seedNews: NewsArticle[] = [
  {
    id: 'n1',
    title: 'CBFC Academy Launches Elite Summer Programme 2025',
    slug: 'cbfc-academy-elite-summer-programme-2025',
    excerpt: 'Our most comprehensive summer development programme yet, featuring international coaching staff and exposure matches.',
    content: '<p>CBFC Academy is proud to announce the launch of our Elite Summer Programme 2025, designed to accelerate player development during the off-season.</p><p>The programme features intensive technical sessions, tactical workshops, and competitive exposure matches against top regional academies.</p>',
    category: 'academy_news',
    coverImage: CBFC_MEDIA.tata.action,
    author: 'CBFC Media',
    published: true,
    featured: true,
    publishedAt: '2025-01-10',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-10',
  },
  {
    id: 'n2',
    title: 'Tata Secures European Trial',
    slug: 'tata-european-trial',
    excerpt: 'Academy forward Tata has been invited for a trial with a Portuguese Primeira Liga club.',
    content: '<p>Following an outstanding season with CBFC Academy, forward Tata has secured a trial opportunity in Portugal.</p>',
    category: 'trial_news',
    coverImage: CBFC_MEDIA.tata.side,
    author: 'CBFC Agency',
    published: true,
    featured: false,
    publishedAt: '2024-11-20',
    createdAt: '2024-11-20',
    updatedAt: '2024-11-20',
  },
  {
    id: 'n3',
    title: 'CBFC Professional Secures Important Victory',
    slug: 'cbfc-professional-victory',
    excerpt: 'The first team delivered a commanding 3-1 performance in their latest league fixture.',
    content: '<p>CBFC Professional continued their strong league form with a convincing victory at home.</p>',
    category: 'club_news',
    coverImage: CBFC_MEDIA.chocho.action,
    author: 'CBFC Media',
    published: true,
    featured: false,
    publishedAt: '2025-01-05',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
  },
  {
    id: 'n4',
    title: 'International Scouting Network Expands',
    slug: 'international-scouting-network-expands',
    excerpt: 'CBFC Agency announces new partnerships with clubs across Europe and Asia.',
    content: '<p>Our agency division continues to grow its international network, creating more opportunities for CBFC players.</p>',
    category: 'agency_announcements',
    coverImage: CBFC_MEDIA.chocho.back,
    author: 'CBFC Agency',
    published: true,
    featured: false,
    publishedAt: '2024-12-15',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-15',
  },
];

export const seedVideos: Video[] = [
  {
    id: 'v1',
    title: 'Tata: Season Highlights',
    thumbnail: CBFC_MEDIA.tata.side,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    playerId: '1',
    playerName: 'Tata',
    position: 'forward',
    ageCategory: 'U19',
    duration: '4:32',
    featured: true,
    createdAt: '2024-12-01',
  },
  {
    id: 'v2',
    title: 'Chocho: Midfield Masterclass',
    thumbnail: CBFC_MEDIA.chocho.side,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    playerId: '2',
    playerName: 'Chocho',
    position: 'midfielder',
    ageCategory: 'Senior',
    duration: '3:15',
    featured: false,
    createdAt: '2024-11-15',
  },
  {
    id: 'v3',
    title: 'Academy Training Session: Technical Drills',
    thumbnail: CBFC_MEDIA.tata.action,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    position: 'midfielder',
    ageCategory: 'U17',
    duration: '5:48',
    featured: false,
    createdAt: '2024-10-20',
  },
  {
    id: 'v4',
    title: 'Chocho: Skills Compilation',
    thumbnail: CBFC_MEDIA.chocho.action,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    playerId: '2',
    playerName: 'Chocho',
    position: 'midfielder',
    ageCategory: 'U19',
    duration: '2:56',
    featured: false,
    createdAt: '2024-11-01',
  },
];

export const seedClubStaff: ClubStaff[] = [
  { id: 's1', name: 'Coach Michael Adebayo', role: 'Head Coach' },
  { id: 's2', name: 'Coach Sarah Williams', role: 'Assistant Coach' },
  { id: 's3', name: 'Coach Peter Nwosu', role: 'Fitness Coach' },
  { id: 's4', name: 'Coach Ahmed Bello', role: 'Goalkeeping Coach' },
  { id: 's5', name: 'John Osei', role: 'Team Manager' },
];

export const seedFixtures: Fixture[] = [
  { id: 'f1', homeTeam: 'CBFC', awayTeam: 'City Rangers', homeScore: 3, awayScore: 1, date: '2025-01-05', venue: 'CBFC Stadium', competition: 'Premier League', isUpcoming: false },
  { id: 'f2', homeTeam: 'United FC', awayTeam: 'CBFC', homeScore: 0, awayScore: 2, date: '2024-12-20', venue: 'United Arena', competition: 'Premier League', isUpcoming: false },
  { id: 'f3', homeTeam: 'CBFC', awayTeam: 'Rovers FC', date: '2025-01-25', venue: 'CBFC Stadium', competition: 'Premier League', isUpcoming: true },
  { id: 'f4', homeTeam: 'Athletic SC', awayTeam: 'CBFC', date: '2025-02-08', venue: 'Athletic Ground', competition: 'Cup', isUpcoming: true },
];

export const seedActivity: ActivityItem[] = [
  { id: 'act1', type: 'trial', title: 'Tata: European Trial', description: 'Invited for trial with Portuguese club', date: '2024-11-20', playerId: '1' },
  { id: 'act2', type: 'achievement', title: 'Chocho: Player of the Month', description: 'Named league midfielder of the month', date: '2024-09-01', playerId: '2' },
  { id: 'act3', type: 'camp', title: 'Elite Winter Camp Begins', description: '30 players selected for intensive camp programme', date: '2024-12-20' },
  { id: 'act4', type: 'club', title: 'CBFC Wins 3-1', description: 'Dominant home performance against City Rangers', date: '2025-01-05' },
  { id: 'act5', type: 'agency', title: 'New European Partnership', description: 'CBFC Agency signs partnership with Belgian club', date: '2024-12-15' },
];

export const seedSiteStats: SiteStats = {
  registeredPlayers: 156,
  academyGraduates: 42,
  playersAbroad: 8,
  playersOnTrial: 5,
  scoutRequests: 23,
  clubMatchesPlayed: 87,
  professionalPlacements: 12,
};

export const seedClubStats: ClubStats = {
  matchesPlayed: 24,
  wins: 16,
  goalsScored: 48,
  cleanSheets: 9,
  playersDeveloped: 35,
  leaguePosition: 3,
};

export const seedGallery: GalleryItem[] = [
  { id: 'g1', title: 'Tata: In Action', imageUrl: CBFC_MEDIA.tata.action, category: 'training' },
  { id: 'g2', title: 'Tata: Match Day', imageUrl: CBFC_MEDIA.tata.action2, category: 'matchday' },
  { id: 'g3', title: 'Chocho: In Action', imageUrl: CBFC_MEDIA.chocho.action, category: 'training' },
  { id: 'g4', title: 'Chocho: Tournament', imageUrl: CBFC_MEDIA.chocho.back, category: 'tournament' },
];

export const SEED_ACADEMY_FACILITY_IDS = {
  training: '550e8400-e29b-41d4-a716-446655440001',
  gym: '550e8400-e29b-41d4-a716-446655440002',
  classrooms: '550e8400-e29b-41d4-a716-446655440003',
  medical: '550e8400-e29b-41d4-a716-446655440004',
  recovery: '550e8400-e29b-41d4-a716-446655440005',
} as const;

export const seedAcademyFacilities: AcademyFacility[] = [
  { id: SEED_ACADEMY_FACILITY_IDS.training, name: 'Training Ground', imageUrl: CBFC_MEDIA.tata.action, sortOrder: 0 },
  { id: SEED_ACADEMY_FACILITY_IDS.gym, name: 'Gym', imageUrl: CBFC_MEDIA.tata.action2, sortOrder: 1 },
  { id: SEED_ACADEMY_FACILITY_IDS.classrooms, name: 'Classrooms', imageUrl: CBFC_MEDIA.chocho.action, sortOrder: 2 },
  { id: SEED_ACADEMY_FACILITY_IDS.medical, name: 'Medical Support', imageUrl: CBFC_MEDIA.chocho.back, sortOrder: 3 },
  { id: SEED_ACADEMY_FACILITY_IDS.recovery, name: 'Recovery Area', imageUrl: CBFC_MEDIA.tata.action, sortOrder: 4 },
];

export const seedAcademyFacilitiesSection: AcademyFacilitiesSection = {
  sectionLabel: 'Facilities',
  sectionHeading: 'World-Class Environment',
  facilities: seedAcademyFacilities,
};
