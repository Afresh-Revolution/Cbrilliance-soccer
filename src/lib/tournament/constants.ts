export const TOURNAMENT_FEE_NAIRA = 35500;

export const TOURNAMENT_TITLE = 'CBRILLIANCE FOOTBALL AGENCY - TOURNAMENT';

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function isSquadLocked(status: string): boolean {
  return status === 'approved' || status === 'rejected';
}
