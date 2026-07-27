export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/academy', label: 'Academy' },
  { href: '/players', label: 'Players' },
  { href: '/agency', label: 'Agency' },
  { href: '/club', label: 'Professional Club' },
  { href: '/#shop', label: 'Shop Now' },
  { href: '/video-hub', label: 'Video Hub' },
  { href: '/player-movement', label: 'Player Movement' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS = {
  divisions: [
    { href: '/academy', label: 'CBFC Academy' },
    { href: '/agency', label: 'CBFC Agency' },
    { href: '/club', label: 'Professional Club' },
  ],
  quick: [
    { href: '/players', label: 'Players' },
    { href: '/#shop', label: 'Shop Now' },
    { href: '/video-hub', label: 'Video Hub' },
    { href: '/player-movement', label: 'Player Movement' },
    { href: '/news', label: 'News' },
    { href: '/contact', label: 'Contact' },
  ],
};

export const STATUS_LABELS: Record<string, string> = {
  available_for_trials: 'Available For Trials',
  on_trial: 'On Trial',
  abroad: 'Abroad',
  in_development: 'In Development',
  professional_squad: 'Professional Squad',
  in_camp: 'In Camp',
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  invited: 'Invited',
  rejected: 'Rejected',
  pending: 'Pending',
  contacted: 'Contacted',
  closed: 'Closed',
};

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  pending: 'Pending',
  contacted: 'Contacted',
  closed: 'Closed',
};

export const POSITION_LABELS: Record<string, string> = {
  goalkeeper: 'Goalkeeper',
  defender: 'Defender',
  midfielder: 'Midfielder',
  forward: 'Forward',
};

export const NEWS_CATEGORY_LABELS: Record<string, string> = {
  academy_news: 'Academy News',
  player_updates: 'Player Updates',
  trial_news: 'Trial News',
  club_news: 'Club News',
  international_opportunities: 'International Opportunities',
  agency_announcements: 'Agency Announcements',
};
