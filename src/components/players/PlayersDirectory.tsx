'use client';

import { useState, useEffect } from 'react';
import type { Player } from '@/types';
import PlayerCard from './PlayerCard';
import PillTabs from '@/components/common/PillTabs';
import { POSITION_LABELS } from '@/lib/constants/navigation';

const POSITION_FILTERS = [
  { id: '', label: 'All' },
  ...Object.entries(POSITION_LABELS).map(([id, label]) => ({ id, label })),
];

export default function PlayersDirectory() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (position) params.set('position', position);

    setLoading(true);
    fetch(`/api/players?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      });
  }, [search, position]);

  return (
    <section className="section section--surface">
      <div className="container">
        <div className="section__header">
          <p className="label">Full Roster</p>
          <h2>All Players</h2>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
          <input
            className="form__input"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, maxWidth: 360, borderRadius: '100px', padding: '0.75rem 1.25rem' }}
          />
          <PillTabs items={POSITION_FILTERS} active={position} onChange={setPosition} />
        </div>

        {loading ? (
          <p className="text-muted text-center">Loading...</p>
        ) : (
          <div className="grid grid--3">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        {!loading && players.length === 0 && (
          <p className="text-muted text-center">No players found.</p>
        )}
      </div>
    </section>
  );
}
