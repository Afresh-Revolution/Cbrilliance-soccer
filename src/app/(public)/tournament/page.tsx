import type { Metadata } from 'next';
import { getTournamentBankDetails } from '@/lib/data/tournament';
import TournamentPageClient from './TournamentPageClient';

export const metadata: Metadata = {
  title: 'Tournament Registration',
  description: 'Register your team for the CBrilliance Football Agency tournament.',
};

export default async function TournamentPage() {
  const bankDetails = await getTournamentBankDetails();
  return <TournamentPageClient bankDetails={bankDetails} />;
}
