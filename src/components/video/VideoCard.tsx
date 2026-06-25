'use client';

import Image from 'next/image';
import type { Video } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div className="video-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="video-card__thumb">
        <Image src={video.thumbnail} alt={video.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="video-card__play">
          <span>▶</span>
        </div>
        <span className="video-card__duration">{video.duration}</span>
      </div>
      <div className="video-card__info">
        <h4 className="video-card__title">{video.title}</h4>
        <p className="video-card__meta">
          {video.playerName && `${video.playerName} • `}
          {video.position && POSITION_LABELS[video.position]}
          {video.ageCategory && ` • ${video.ageCategory}`}
        </p>
      </div>
    </div>
  );
}
