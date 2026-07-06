'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import MediaImage from '@/components/common/MediaImage';

interface Props {
  players: Player[];
}

export default function HeroPlayerCarousel({ players }: Props) {
  const slides = players.filter((p) => p.featured).slice(0, 5);
  const items = slides.length > 0 ? slides : players.slice(0, 4);

  const [index, setIndex] = useState(0);
  const current = items[index];

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    const timer = setInterval(() => go(1), 5500);
    return () => clearInterval(timer);
  }, [go]);

  if (!current) return null;

  return (
    <div className="hero-carousel">
      <div className="hero-carousel__frame">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="hero-carousel__slide"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <MediaImage
              src={current.profilePhoto}
              alt={current.fullName}
              fill
              sizes="(max-width: 1024px) 90vw, 50vw"
              className="hero-carousel__img"
              priority={index === 0}
            />
            <div className="hero-carousel__overlay" />
          </motion.div>
        </AnimatePresence>

        <Link href={`/player/${current.slug}`} className="hero-carousel__info">
          <span className="hero-carousel__position">{POSITION_LABELS[current.position]}</span>
          <span className="hero-carousel__name">{current.fullName}</span>
        </Link>
      </div>

      <div className="hero-carousel__controls">
        <button type="button" onClick={() => go(-1)} aria-label="Previous player">
          ←
        </button>
        <div className="hero-carousel__dots">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`hero-carousel__dot ${i === index ? 'hero-carousel__dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show ${p.fullName}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next player">
          →
        </button>
      </div>
    </div>
  );
}
