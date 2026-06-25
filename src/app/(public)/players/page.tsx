import type { Metadata } from 'next';
import { getPlayers } from '@/lib/data/queries';
import PlayersDirectory from '@/components/players/PlayersDirectory';
import PlayerShowcase from '@/components/players/PlayerShowcase';

export const metadata: Metadata = {
  title: 'Players',
  description: 'Discover CBFC talent — immersive player discovery.',
};

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <>
      <PlayerShowcase players={players} />
      <PlayersDirectory />
    </>
  );
}
