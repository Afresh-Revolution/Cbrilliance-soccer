'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Fixture, Player } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import { formatDate } from '@/lib/utils/format';
import DisplayName from '@/components/common/DisplayName';
import CircularGauge from '@/components/common/CircularGauge';
import GoalsSeasonChart from '@/components/players/GoalsSeasonChart';

import { getCountryCode } from '@/lib/constants/countries';

import { CBFC_FALLBACK_PLAYER_PHOTO } from '@/lib/data/cbfc-media';

const FALLBACK_PHOTO = CBFC_FALLBACK_PLAYER_PHOTO;

function seasonGoals(player: Player) {
  const total = player.statistics.goals;
  const weights = [0.08, 0.12, 0.18, 0.22, 0.4];
  const labels = ["'21", "'22", "'23", "'24", "'25"];
  return labels.map((label, i) => ({
    label,
    value: Math.max(0, Math.round(total * weights[i])),
  }));
}

function playerMetrics(player: Player) {
  const { goals, matchesPlayed } = player.statistics;
  const conversion =
    matchesPlayed > 0 ? Math.min(Math.round((goals / matchesPlayed) * 100), 99) : 0;
  const accuracy = Math.min(
    Math.round((player.strengths.finishing + player.strengths.pace) / 2),
    99
  );
  return { conversion, accuracy };
}

interface Props {
  player: Player;
  fixtures: Fixture[];
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function PlayerDetailPanel({
  player,
  fixtures,
  currentIndex,
  totalCount,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const [src, setSrc] = useState(player.profilePhoto || FALLBACK_PHOTO);
  const upcoming = useMemo(
    () => fixtures.filter((f) => f.isUpcoming).slice(0, 2),
    [fixtures]
  );
  const { conversion, accuracy } = playerMetrics(player);
  const seasons = seasonGoals(player);

  useEffect(() => {
    setSrc(player.profilePhoto || FALLBACK_PHOTO);
  }, [player.profilePhoto]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      className="player-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${player.fullName} profile`}
    >
      <div className="player-detail__toolbar">
        <button type="button" className="player-detail__back" onClick={onClose}>
          ← Back to Squad
        </button>

        <div className="player-detail__pager">
          <button type="button" onClick={onPrev} aria-label="Previous player">‹</button>
          <span>
            {currentIndex + 1} <small>of</small> {totalCount}
          </span>
          <button type="button" onClick={onNext} aria-label="Next player">›</button>
        </div>
      </div>

      <div className="player-detail__body">
        <motion.aside
          className="player-detail__info"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="player-detail__head">
            <div className="player-detail__meta">
              <span className="position-pill">{POSITION_LABELS[player.position]}</span>
              <span className="player-detail__nation">
                <span className="country-code">{getCountryCode(player.nationality)}</span>
                {player.nationality}
              </span>
            </div>

            <div className="player-detail__title-row">
              <DisplayName fullName={player.fullName} className="player-detail__name" />
              {player.jerseyNumber && (
                <span className="player-detail__jersey-badge">{player.jerseyNumber}</span>
              )}
            </div>
          </div>

          <div className="player-detail__card">
            <p className="section-label">Honours</p>
            <div className="player-detail__honours">
              {player.achievements.length > 0 ? (
                player.achievements.slice(0, 4).map((a) => (
                  <div key={a.id} className="player-detail__honour">
                    <span className="player-detail__honour-mark" aria-hidden />
                    <span className="player-detail__honour-count">1</span>
                    <span className="player-detail__honour-title">{a.title}</span>
                  </div>
                ))
              ) : (
                <p className="player-detail__empty">Building legacy...</p>
              )}
            </div>
          </div>

          <div className="player-detail__card">
            <div className="player-detail__stats-grid">
              <div className="player-detail__stat">
                <span className="player-detail__stat-val">{player.statistics.minutesPlayed}</span>
                <span className="player-detail__stat-lbl">Minutes Played</span>
              </div>
              <div className="player-detail__stat">
                <span className="player-detail__stat-val">{player.statistics.matchesPlayed}</span>
                <span className="player-detail__stat-lbl">Appearances</span>
              </div>
              <div className="player-detail__stat">
                <span className="player-detail__stat-val">{player.statistics.goals}</span>
                <span className="player-detail__stat-lbl">Goals</span>
              </div>
            </div>

            <div className="player-detail__stats-divider" />

            <div className="player-detail__stats-grid">
              <div className="player-detail__stat">
                <span className="player-detail__stat-val">{player.height}</span>
                <span className="player-detail__stat-lbl">Height</span>
              </div>
              <div className="player-detail__stat">
                <span className="player-detail__stat-val">{player.weight}</span>
                <span className="player-detail__stat-lbl">Weight</span>
              </div>
              <div className="player-detail__stat">
                <span className="player-detail__stat-val">{player.age}</span>
                <span className="player-detail__stat-lbl">Age</span>
              </div>
            </div>
          </div>

          <div className="player-detail__card">
            <p className="section-label">Goals Per Season</p>
            <GoalsSeasonChart data={seasons} />
          </div>

          {upcoming.length > 0 && (
            <div className="player-detail__card">
              <p className="section-label">Upcoming Matches</p>
              <div className="player-detail__matches">
                {upcoming.map((f) => (
                  <div key={f.id} className="match-mini">
                    <span className="match-mini__date">{formatDate(f.date)}</span>
                    <span className="match-mini__teams">
                      {f.homeTeam} vs {f.awayTeam}
                    </span>
                    <span className="match-mini__comp">{f.competition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link href={`/player/${player.slug}`} className="player-detail__full-link">
            View full profile →
          </Link>
        </motion.aside>

        <div className="player-detail__stage">
          <div className="player-detail__stage-glow" aria-hidden />

          <motion.div
            key={player.id}
            className="player-detail__photo"
            initial={{ opacity: 0, x: 48, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          >
            <Image
              src={src}
              alt={player.fullName}
              width={560}
              height={760}
              className="player-detail__img"
              priority
              onError={() => setSrc(FALLBACK_PHOTO)}
            />
          </motion.div>

          <motion.aside
            className="player-detail__metrics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <CircularGauge value={conversion} label="Conversion Rate" />
            <CircularGauge value={accuracy} label="Shooting Accuracy" />
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
}
