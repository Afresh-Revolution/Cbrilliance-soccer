'use client';

import GalleryForm from '@/components/admin/GalleryForm';
import { galleryToFormValues, type GalleryRecord } from '@/lib/data/gallery-shared';

interface Props {
  mode: 'create' | 'edit';
  item?: GalleryRecord | null;
  onClose: () => void;
  onSaved: (gallery: GalleryRecord) => void;
}

export default function AdminGalleryModal({ mode, item, onClose, onSaved }: Props) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__head">
          <h2 id="gallery-modal-title">
            {mode === 'create' ? 'Add Gallery Image' : 'Edit Gallery Image'}
          </h2>
          <button
            type="button"
            className="admin-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="admin-modal__body">
          <GalleryForm
            mode={mode}
            inModal
            initial={item ? galleryToFormValues(item) : undefined}
            galleryId={item?.id}
            onCancel={onClose}
            onSuccess={onSaved}
          />
        </div>
      </div>
    </div>
  );
}
