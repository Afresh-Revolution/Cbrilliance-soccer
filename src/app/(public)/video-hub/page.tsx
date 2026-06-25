'use client';

import { useState, useEffect } from 'react';
import type { Video } from '@/types';
import VideoCard from '@/components/video/VideoCard';
import { POSITION_LABELS } from '@/lib/constants/navigation';

const positions = ['', 'goalkeeper', 'defender', 'midfielder', 'forward'];
const ages = ['', 'U10', 'U13', 'U15', 'U17', 'U19', 'Senior'];

export default function VideoHubPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [position, setPosition] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [featured, setFeatured] = useState<Video | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (position) params.set('position', position);
    if (ageCategory) params.set('ageCategory', ageCategory);

    fetch(`/api/videos?${params}`)
      .then((r) => r.json())
      .then((data: Video[]) => {
        setVideos(data);
        setFeatured(data.find((v) => v.featured) || data[0] || null);
      });
  }, [position, ageCategory]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">Scouting Media</p>
          <h1>Video <span className="text-gold">Hub</span></h1>
          <p>Premium scouting footage — player highlights, match clips, and training sessions.</p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          {featured && (
            <div className="featured-video">
              <iframe
                src={featured.videoUrl}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="filter-tabs">
            <span className="text-muted" style={{ marginRight: '1rem' }}>Position:</span>
            {positions.map((p) => (
              <button
                key={p || 'all'}
                className={`filter-tabs__tab ${position === p ? 'filter-tabs__tab--active' : ''}`}
                onClick={() => setPosition(p)}
              >
                {p ? POSITION_LABELS[p] : 'All'}
              </button>
            ))}
          </div>

          <div className="filter-tabs">
            <span className="text-muted" style={{ marginRight: '1rem' }}>Age:</span>
            {ages.map((a) => (
              <button
                key={a || 'all'}
                className={`filter-tabs__tab ${ageCategory === a ? 'filter-tabs__tab--active' : ''}`}
                onClick={() => setAgeCategory(a)}
              >
                {a || 'All'}
              </button>
            ))}
          </div>

          <div className="grid grid--3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
