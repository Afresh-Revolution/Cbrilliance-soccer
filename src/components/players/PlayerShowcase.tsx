'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import { seedFixtures } from '@/lib/data/seed';
import PillTabs from '@/components/common/PillTabs';
import PlayerDetailPanel from '@/components/players/PlayerDetailPanel';

const POSITIONS = [
  { id: '', label: 'All' },
  { id: 'goalkeeper', label: 'Goalkeepers' },
  { id: 'defender', label: 'Defenders' },
  { id: 'midfielder', label: 'Midfielders' },
  { id: 'forward', label: 'Forwards' },
];

const FALLBACK_PHOTO =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=800&fit=crop';

function splitName(fullName: string) {
  const parts = fullName.trim().split(' ');
  const last = parts.pop() || fullName;
  const first = parts.join(' ') || last;
  return { first, last };
}

function PlayerPhoto({
  player,
  priority,
}: {
  player: Player;
  priority?: boolean;
}) {
  const [src, setSrc] = useState(player.profilePhoto || FALLBACK_PHOTO);

  useEffect(() => {
    setSrc(player.profilePhoto || FALLBACK_PHOTO);
  }, [player.profilePhoto]);

  return (
    <Image
      src={src}
      alt={player.fullName}
      fill
      sizes="280px"
      className="squad-coverflow__img"
      priority={priority}
      onError={() => setSrc(FALLBACK_PHOTO)}
    />
  );
}

interface Props {
  players: Player[];
}

export default function PlayerShowcase({ players }: Props) {
  const [position, setPosition] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailPlayer, setDetailPlayer] = useState<Player | null>(null);

  const filtered = useMemo(
    () => (position ? players.filter((p) => p.position === position) : players),
    [players, position]
  );

  const go = useCallback(
    (dir: -1 | 1) => {
      setActiveIndex((i) => (i + dir + filtered.length) % filtered.length);
    },
    [filtered.length]
  );

  useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  useEffect(() => {
    if (detailPlayer || filtered.length < 2) return;
    const timer = setInterval(() => go(1), 7000);
    return () => clearInterval(timer);
  }, [go, filtered.length, detailPlayer]);

  useEffect(() => {
    if (!detailPlayer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailPlayer(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailPlayer]);

  const openDetail = useCallback((player: Player) => {
    setDetailPlayer(player);
  }, []);

  const closeDetail = useCallback(() => setDetailPlayer(null), []);

  const detailPrev = useCallback(() => {
    setActiveIndex((i) => {
      const next = (i - 1 + filtered.length) % filtered.length;
      setDetailPlayer(filtered[next]);
      return next;
    });
  }, [filtered]);

  const detailNext = useCallback(() => {
    setActiveIndex((i) => {
      const next = (i + 1) % filtered.length;
      setDetailPlayer(filtered[next]);
      return next;
    });
  }, [filtered]);

  if (!filtered.length) {
    return <p className="text-muted text-center">No players in this category.</p>;
  }

  const activeLabel = position ? POSITION_LABELS[position] : 'Squad';
  const total = filtered.length;
  const visibleOffsets = [-2, -1, 0, 1, 2];

  function getPlayerAtOffset(offset: number) {
    return filtered[(activeIndex + offset + total) % total];
  }

  function cardLayout(offset: number) {
    const abs = Math.abs(offset);
    const spread = 140;
    return {
      x: offset * spread,
      scale: offset === 0 ? 1 : abs === 1 ? 0.76 : 0.58,
      opacity: detailPlayer ? 0 : offset === 0 ? 1 : abs === 1 ? 0.5 : 0.28,
      zIndex: 10 - abs,
    };
  }

  return (
    <section className={`squad-coverflow ${detailPlayer ? 'squad-coverflow--detail' : ''}`}>
      <div className="squad-coverflow__header">
        <div className="squad-coverflow__tabs">
          <span className="squad-coverflow__tab squad-coverflow__tab--active">Players</span>
          <Link href="/club" className="squad-coverflow__tab">Management</Link>
        </div>
        <PillTabs
          items={POSITIONS}
          active={position}
          onChange={(id) => {
            setPosition(id);
            setActiveIndex(0);
            setDetailPlayer(null);
          }}
        />
      </div>

      <div className="squad-coverflow__arena">
        <span className="squad-coverflow__vertical-label">{activeLabel}</span>

        <motion.div
          className="squad-coverflow__track"
          animate={{
            opacity: detailPlayer ? 0 : 1,
            pointerEvents: detailPlayer ? 'none' : 'auto',
          }}
          transition={{ duration: 0.3 }}
        >
          {visibleOffsets.map((offset) => {
            const player = getPlayerAtOffset(offset);
            const layout = cardLayout(offset);
            const { first, last } = splitName(player.fullName);
            const isCenter = offset === 0;

            return (
              <motion.div
                key={`${player.id}-${offset}`}
                className={`squad-coverflow__card ${isCenter ? 'squad-coverflow__card--center' : ''}`}
                animate={{
                  x: layout.x,
                  scale: layout.scale,
                  opacity: layout.opacity,
                  zIndex: layout.zIndex,
                }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ zIndex: layout.zIndex }}
                onClick={() => {
                  if (detailPlayer) return;
                  if (offset !== 0) {
                    setActiveIndex((activeIndex + offset + total) % total);
                  } else {
                    openDetail(player);
                  }
                }}
              >
                <div className={`squad-coverflow__shield ${isCenter ? 'squad-coverflow__shield--clickable' : ''}`}>
                  <PlayerPhoto player={player} priority={isCenter} />
                  {player.jerseyNumber && (
                    <span className="squad-coverflow__number">{player.jerseyNumber}</span>
                  )}
                </div>

                {isCenter ? (
                  <button
                    type="button"
                    className="squad-coverflow__name squad-coverflow__name--center"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(player);
                    }}
                  >
                    <span className="squad-coverflow__name-first">{first}</span>
                    <span className="squad-coverflow__name-last">{last}</span>
                  </button>
                ) : (
                  <div className="squad-coverflow__name squad-coverflow__name--side">
                    <span>{player.fullName}</span>
                    {player.jerseyNumber && <small>#{player.jerseyNumber}</small>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {!detailPlayer && (
          <div className="squad-coverflow__nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous">‹</button>
            <button type="button" onClick={() => go(1)} aria-label="Next">›</button>
          </div>
        )}

        <AnimatePresence>
          {detailPlayer && (
            <PlayerDetailPanel
              key={detailPlayer.id}
              player={detailPlayer}
              fixtures={seedFixtures}
              currentIndex={activeIndex}
              totalCount={filtered.length}
              onClose={closeDetail}
              onPrev={detailPrev}
              onNext={detailNext}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
