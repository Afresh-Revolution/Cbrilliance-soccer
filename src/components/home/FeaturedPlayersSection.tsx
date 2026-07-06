import { getPlayers, prioritizeFeaturedPlayers } from '@/lib/data/queries';
import PlayerCard from '@/components/players/PlayerCard';
import FadeIn from '@/components/common/FadeIn';
import Button from '@/components/common/Button';

export default async function FeaturedPlayersSection() {
  const allPlayers = await getPlayers();
  const players = prioritizeFeaturedPlayers(allPlayers, 3);

  return (
    <section className="section section--surface">
      <div className="container">
        <div className="section__header">
          <p className="label">Talent Showcase</p>
          <h2>Featured Players</h2>
          <p>Discover the next generation of football talent developed through the CBFC pathway.</p>
        </div>

        <div className="grid grid--3">
          {players.map((player, i) => (
            <FadeIn key={player.id} index={i}>
              <PlayerCard player={player} />
            </FadeIn>
          ))}
        </div>

        <div className="text-center mt-xl">
          <Button href="/players" variant="outline">
            View All Players
          </Button>
        </div>
      </div>
    </section>
  );
}
