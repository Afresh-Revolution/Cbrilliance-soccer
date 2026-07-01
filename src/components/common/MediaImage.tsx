'use client';

import { useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  CBFC_FALLBACK_PLAYER_PHOTO,
  resolveMediaUrl,
  shouldBypassImageOptimizer,
} from '@/lib/data/cbfc-media';

type Props = Omit<ImageProps, 'src'> & {
  src: string | null | undefined;
  fallbackSrc?: string;
};

export default function MediaImage({
  src,
  fallbackSrc = CBFC_FALLBACK_PLAYER_PHOTO,
  alt,
  unoptimized: unoptimizedProp,
  ...props
}: Props) {
  const resolved = resolveMediaUrl(src) || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(resolved);
  const unoptimized = unoptimizedProp ?? shouldBypassImageOptimizer(currentSrc);

  useEffect(() => {
    setCurrentSrc(resolveMediaUrl(src) || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
