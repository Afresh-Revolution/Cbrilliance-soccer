import Image from 'next/image';
import type { GalleryItem } from '@/types';

export function PublicGalleryGrid({ images }: { images: GalleryItem[] }) {
  if (images.length === 0) return <p>No images in the gallery yet.</p>;

  return (
    <div className="gallery-grid">
      {images.map((item) => (
        <div key={item.id} className="gallery-grid__item">
          <div className="gallery-grid__img-wrap">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="gallery-grid__img"
            />
          </div>
          <div className="gallery-grid__overlay">
            <p className="gallery-grid__title">{item.title}</p>
            {item.category && <p className="gallery-grid__category">{item.category}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}