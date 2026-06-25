import { getPlayers, getClubStaff, getFixtures, getClubStats } from '@/lib/data/queries';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import { formatDate } from '@/lib/utils/format';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import FadeIn from '@/components/common/FadeIn';
import Button from '@/components/common/Button';
import Image from 'next/image';
import { seedGallery } from '@/lib/data/seed';

export const metadata = {
  title: 'Professional Club',
  description: 'CBFC Professional — representing excellence on the pitch.',
};

export default async function ClubPage() {
  const [squad, staff, fixtures, stats] = await Promise.all([
    getPlayers({ status: 'professional_squad' }),
    getClubStaff(),
    getFixtures(),
    getClubStats(),
  ]);

  const upcoming = fixtures.filter((f) => f.isUpcoming);
  const results = fixtures.filter((f) => !f.isUpcoming);
  const trophies = [
    { name: 'Regional Cup 2024', year: '2024' },
    { name: 'League Runners-Up 2023', year: '2023' },
    { name: 'Academy Cup 2022', year: '2022' },
  ];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">CBFC Professional</p>
          <h1>Representing Excellence <span className="text-gold">On The Pitch</span></h1>
          <p>Our senior team competing at the highest level with talent developed through the CBFC pathway.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="section__header">
            <p className="label">First Team</p>
            <h2>Squad</h2>
          </div>
          <div className="grid grid--4">
            {squad.map((player, i) => (
              <FadeIn key={player.id} index={i}>
                <div className="squad-card">
                  {player.jerseyNumber && (
                    <div className="squad-card__number">#{player.jerseyNumber}</div>
                  )}
                  <div className="squad-card__photo">
                    <Image src={player.profilePhoto} alt={player.fullName} width={120} height={120} />
                  </div>
                  <h4>{player.fullName}</h4>
                  <p className="text-muted">{POSITION_LABELS[player.position]} • {player.nationality}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <div className="section__header">
            <p className="label">Coaching</p>
            <h2>Staff</h2>
          </div>
          <div className="grid grid--3">
            {staff.map((s, i) => (
              <FadeIn key={s.id} index={i}>
                <div className="staff-card">
                  <p className="staff-card__role">{s.role}</p>
                  <h4>{s.name}</h4>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <div className="grid grid--2">
            <div>
              <h2 className="mb-lg">Upcoming Fixtures</h2>
              {upcoming.map((f) => (
                <div key={f.id} className="fixture-card">
                  <div className="fixture-card__teams">
                    <strong>{f.homeTeam} vs {f.awayTeam}</strong>
                    <p className="fixture-card__date">{formatDate(f.date)} • {f.venue}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="mb-lg">Recent Results</h2>
              {results.map((f) => (
                <div key={f.id} className="fixture-card">
                  <div className="fixture-card__teams">
                    <strong>{f.homeTeam}</strong>
                  </div>
                  <div className="fixture-card__score">
                    {f.homeScore} - {f.awayScore}
                  </div>
                  <div className="fixture-card__teams">
                    <strong>{f.awayTeam}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center mt-lg text-muted">League Position: <strong className="text-gold">#{stats.leaguePosition}</strong></p>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <h2 className="text-center mb-lg">Club Statistics</h2>
          <div className="grid grid--4">
            {[
              { label: 'Matches Played', value: stats.matchesPlayed },
              { label: 'Wins', value: stats.wins },
              { label: 'Goals Scored', value: stats.goalsScored },
              { label: 'Clean Sheets', value: stats.cleanSheets },
            ].map((s, i) => (
              <FadeIn key={s.label} index={i}>
                <div className="stat-card">
                  <AnimatedCounter value={s.value} />
                  <p className="stat-card__label">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <h2 className="text-center mb-lg">Achievements</h2>
          <div className="grid grid--3">
            {trophies.map((t, i) => (
              <FadeIn key={t.name} index={i}>
                <div className="trophy-card">
                  <div className="trophy-card__icon" aria-hidden />
                  <h4>{t.name}</h4>
                  <p className="text-muted">{t.year}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <h2 className="text-center mb-lg">Club Gallery</h2>
          <div className="grid grid--3">
            {seedGallery.map((g, i) => (
              <FadeIn key={g.id} index={i}>
                <div className="facility-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt={g.title} />
                  <div className="facility-card__label">{g.title}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container text-center">
          <h2 className="mb-lg">Partner With CBFC</h2>
          <div className="flex-center gap-md" style={{ flexWrap: 'wrap' }}>
            <Button href="/contact">Become A Partner</Button>
            <Button href="/contact" variant="outline">Sponsor CBFC</Button>
            <Button href="/contact" variant="ghost">Contact Club</Button>
          </div>
        </div>
      </section>
    </>
  );
}
