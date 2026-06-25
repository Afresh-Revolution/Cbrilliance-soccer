'use client';

import { useState, useEffect } from 'react';

const WORDS = ['Greatness', 'Excellence', 'Champions', 'Glory', 'Legacy', 'Triumph'];
const TYPE_SPEED = 85;
const DELETE_SPEED = 45;
const PAUSE_MS = 2200;

export default function TypewriterText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = WORDS[wordIndex];

    if (!isDeleting && displayed === current) {
      const pause = setTimeout(() => setIsDeleting(true), PAUSE_MS);
      return () => clearTimeout(pause);
    }

    if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % WORDS.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setDisplayed(current.slice(0, displayed.length - 1));
        } else {
          setDisplayed(current.slice(0, displayed.length + 1));
        }
      },
      isDeleting ? DELETE_SPEED : TYPE_SPEED
    );

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  return (
    <span className="typewriter" aria-live="polite">
      <span className="typewriter__text text-gold">{displayed}</span>
      <span className="typewriter__cursor" aria-hidden="true" />
    </span>
  );
}
