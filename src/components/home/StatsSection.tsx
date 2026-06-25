import { getSiteStats } from '@/lib/data/queries';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import FadeIn from '@/components/common/FadeIn';

export default async function StatsSection() {
  const stats = await getSiteStats();

  const items = [
    { label: 'Registered Players', value: stats.registeredPlayers },
    { label: 'Academy Graduates', value: stats.academyGraduates },
    { label: 'Players Abroad', value: stats.playersAbroad },
    { label: 'Players On Trial', value: stats.playersOnTrial },
    { label: 'Scout Requests', value: stats.scoutRequests },
    { label: 'Club Matches Played', value: stats.clubMatchesPlayed },
    { label: 'Professional Placements', value: stats.professionalPlacements },
  ];

  return (
    <section className="section section--dark">
      <div className="container">
        <div className="section__header">
          <p className="label">Our Impact</p>
          <h2>CBFC By The Numbers</h2>
        </div>

        <div className="grid grid--4">
          {items.map((item, i) => (
            <FadeIn key={item.label} index={i}>
              <div className="stat-card">
                <AnimatedCounter value={item.value} />
                <p className="stat-card__label">{item.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
