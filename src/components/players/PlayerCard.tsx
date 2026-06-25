'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Player } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/player/${player.slug}`} className="player-card-v2">
      {player.jerseyNumber && (
        <span className="player-card-v2__num">{player.jerseyNumber}</span>
      )}
      <div className="player-card-v2__photo">
        <Image
          src={player.profilePhoto}
          alt={player.fullName}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="player-card-v2__gradient" />
      </div>
      <div className="player-card-v2__body">
        <h3 className="player-card-v2__name">{player.fullName}</h3>
        <p className="player-card-v2__meta">
          {POSITION_LABELS[player.position]} · {player.age} · {player.nationality}
        </p>
      </div>
    </Link>
  );
}
