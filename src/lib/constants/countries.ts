const COUNTRY_CODES: Record<string, string> = {
  Nigeria: 'NG',
  Ghana: 'GH',
};

export function getCountryCode(nationality: string): string {
  return COUNTRY_CODES[nationality] || nationality.slice(0, 2).toUpperCase();
}
