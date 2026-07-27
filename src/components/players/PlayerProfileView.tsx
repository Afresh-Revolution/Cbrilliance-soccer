import MediaImage from '@/components/common/MediaImage';
import Link from 'next/link';
import type { Player } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import { formatDate } from '@/lib/utils/format';
import DisplayName from '@/components/common/DisplayName';
import CircularGauge from '@/components/common/CircularGauge';
import Button from '@/components/common/Button';
import { getCountryCode } from '@/lib/constants/countries';

interface Props {
  player: Player;
  whatsapp?: string | null;
}

export default function PlayerProfileView({ player, whatsapp }: Props) {
  const skillKeys = ['pace', 'finishing', 'passing', 'dribbling'] as const;
  const skillValues = skillKeys.map((k) => player.strengths[k]);

  const topSkills = Object.entries(player.strengths)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <div className="player-profile-v2">
      <div className="player-profile-v2__grid">
        <div className="player-profile-v2__header">
          <DisplayName fullName={player.fullName} />
        </div>

        <div className="player-profile-v2__meta-row">
          <span className="position-pill">{POSITION_LABELS[player.position]}</span>
          <span>
            <span className="country-code">{getCountryCode(player.nationality)}</span>
            {player.nationality}
          </span>
        </div>

        <div className="player-profile-v2__hero">
          <div className="player-profile-v2__shield" />
          {player.jerseyNumber && (
            <div className="player-profile-v2__jersey jersey-num">{player.jerseyNumber}</div>
          )}
          <div className="player-profile-v2__photo-wrap">
            <MediaImage
              src={player.profilePhoto}
              alt={player.fullName}
              width={600}
              height={800}
              priority
            />
          </div>
        </div>

        <div className="player-profile-v2__panels">
            <div className="player-profile-v2__panel">
              <p className="section-label">Honours</p>
              <div className="honour-row">
                {player.achievements.length > 0 ? (
                  player.achievements.slice(0, 4).map((a) => (
                    <div key={a.id} className="honour-row__item">
                      <span className="honour-row__mark" aria-hidden />
                      <span>1</span>
                      <small>{a.title.slice(0, 20)}</small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Building legacy...</p>
                )}
              </div>
            </div>

            <div className="player-profile-v2__panel">
              <p className="section-label">Season Performance</p>
              <div className="player-profile-v2__stats-row">
                <div className="stat-block">
                  <div className="stat-block__value">{player.statistics.matchesPlayed}</div>
                  <div className="stat-block__label">Matches</div>
                </div>
                <div className="stat-block">
                  <div className="stat-block__value">{player.statistics.goals}</div>
                  <div className="stat-block__label">Goals</div>
                </div>
                <div className="stat-block">
                  <div className="stat-block__value">{player.statistics.assists}</div>
                  <div className="stat-block__label">Assists</div>
                </div>
              </div>

              <div className="skill-chart">
                <p className="section-label" style={{ marginTop: '1rem' }}>Key Attributes</p>
                <div className="skill-chart__bars">
                  {skillValues.map((v, i) => (
                    <div key={skillKeys[i]} className="skill-chart__bar" style={{ height: `${v}%` }} />
                  ))}
                </div>
                <div className="skill-chart__labels">
                  {skillKeys.map((k) => (
                    <span key={k}>{k.slice(0, 3)}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="player-profile-v2__panel">
              <p className="section-label">Profile</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><span className="text-muted">Age</span><br /><strong>{player.age}</strong></div>
                <div><span className="text-muted">Height</span><br /><strong>{player.height}</strong></div>
                <div><span className="text-muted">Weight</span><br /><strong>{player.weight}</strong></div>
                <div><span className="text-muted">Foot</span><br /><strong style={{ textTransform: 'capitalize' }}>{player.preferredFoot}</strong></div>
              </div>
            </div>
          </div>

        <div className="player-profile-v2__gauges">
            {topSkills.map(([name, val]) => (
              <CircularGauge key={name} value={val} label={name.charAt(0).toUpperCase() + name.slice(1)} />
            ))}
        </div>

        <div className="player-profile-v2__cta-row">
            <Button href={`/agency?player=${player.slug}`} variant="primary">Request Player</Button>
            <Button href="/agency" variant="outline">Contact Agency</Button>
            {whatsapp ? (
              <Button
                href={`https://wa.me/${whatsapp}?text=Interested in ${player.fullName}`}
                variant="ghost"
              >
                WhatsApp
              </Button>
            ) : null}
        </div>
      </div>

      <section className="player-profile-v2__bio-section">
        <p className="section-label">Biography</p>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.75)' }}>{player.biography}</p>
      </section>

      {player.movementHistory.length > 0 && (
        <section className="player-profile-v2__timeline">
          <p className="section-label">Career Pathway</p>
          <div className="timeline">
            {player.movementHistory.map((m) => (
              <div key={m.id} className="timeline__item">
                <p className="timeline__date">{formatDate(m.date)}</p>
                <h4 className="timeline__title">{m.title}</h4>
                {m.description && <p className="timeline__desc">{m.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
