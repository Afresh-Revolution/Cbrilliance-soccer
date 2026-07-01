import type { GalleryItem } from '@/types';
import MediaImage from '@/components/common/MediaImage';

interface Props {
  items: GalleryItem[];
}

export default function GalleryGrid({ items }: Props) {
  if (items.length === 0) {
    return <p className="gallery-grid__empty">Gallery images will appear here soon.</p>;
  }

  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <article key={item.id} className="gallery-grid__item">
          <div className="gallery-grid__img-wrap">
            {item.imageUrl ? (
              <MediaImage
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="gallery-grid__img"
                fallbackSrc=""
              />
            ) : (
              <div className="gallery-grid__placeholder" aria-hidden />
            )}
          </div>
          <div className="gallery-grid__overlay">
            <p className="gallery-grid__title">{item.title}</p>
            {item.category ? <p className="gallery-grid__category">{item.category}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
