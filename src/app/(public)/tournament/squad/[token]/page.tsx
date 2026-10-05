import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTournamentRegistrationByToken } from '@/lib/data/tournament';
import { isTournamentAccessToken } from '@/lib/tournament/errors';
import SquadDashboardClient from './SquadDashboardClient';

interface Props {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Squad registration',
  robots: { index: false, follow: false },
};

export default async function TournamentSquadPage({ params }: Props) {
  const { token } = await params;
  if (!isTournamentAccessToken(token)) notFound();

  const squad = await getTournamentRegistrationByToken(token);
  if (!squad) notFound();

  return <SquadDashboardClient token={token} squad={squad} />;
}
