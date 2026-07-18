'use client';

import Link from 'next/link';
import type { Player } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import MediaImage from '@/components/common/MediaImage';

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/player/${player.slug}`} className="player-card-v2">
      <div className="player-card-v2__photo">
        <MediaImage
          src={player.profilePhoto}
          alt={player.fullName}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="player-card-v2__gradient" />
        {player.jerseyNumber && (
          <span className="player-card-v2__num" aria-label={`Jersey number ${player.jerseyNumber}`}>
            {player.jerseyNumber}
          </span>
        )}
      </div>
      <div className="player-card-v2__body">
        <h3 className="player-card-v2__name">{player.fullName}</h3>
        <div className="player-card-v2__tags" aria-label="Player details">
          <span className="player-card-v2__tag player-card-v2__tag--position">
            {POSITION_LABELS[player.position]}
          </span>
          <span className="player-card-v2__tag">{player.age} yrs</span>
          <span className="player-card-v2__tag">{player.nationality}</span>
        </div>
      </div>
    </Link>
  );
}
