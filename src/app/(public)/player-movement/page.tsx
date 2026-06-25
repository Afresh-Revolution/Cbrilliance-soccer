import { getPlayers } from '@/lib/data/queries';
import { STATUS_LABELS } from '@/lib/constants/navigation';
import PlayerCard from '@/components/players/PlayerCard';
import FadeIn from '@/components/common/FadeIn';

export const metadata = {
  title: 'Player Movement',
  description: 'Track player pathways from academy to professional opportunities.',
};

const pathwayCategories = [
  { status: 'available_for_trials', label: 'Available For Trials' },
  { status: 'on_trial', label: 'On Trial' },
  { status: 'in_camp', label: 'In Camp' },
  { status: 'abroad', label: 'Abroad' },
  { status: 'professional_squad', label: 'Professional Team' },
] as const;

export default async function PlayerMovementPage() {
  const allPlayers = await getPlayers();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">Player Pathway</p>
          <h1>Player <span className="text-gold">Movement</span></h1>
          <p>Track the development journey of CBFC talent from academy to international opportunities.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="pathway-timeline mb-lg">
            {pathwayCategories.map((cat, i) => (
              <div key={cat.status} className={`pathway-timeline__step ${i === 0 ? 'pathway-timeline__step--active' : ''}`}>
                <strong>{cat.label}</strong>
                <p className="text-muted mt-sm">
                  {allPlayers.filter((p) => p.status === cat.status).length} players
                </p>
              </div>
            ))}
          </div>

          {pathwayCategories.map((cat) => {
            const players = allPlayers.filter((p) => p.status === cat.status);
            if (players.length === 0) return null;

            return (
              <div key={cat.status} className="pathway-section">
                <div className="pathway-section__header">
                  <h2>{STATUS_LABELS[cat.status]}</h2>
                  <span>{players.length} player{players.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid--3">
                  {players.map((player, i) => (
                    <FadeIn key={player.id} index={i}>
                      <PlayerCard player={player} />
                    </FadeIn>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
