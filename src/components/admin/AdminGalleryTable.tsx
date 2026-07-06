'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGalleryModal from '@/components/admin/AdminGalleryModal';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import MediaImage from '@/components/common/MediaImage';
import type { GalleryRecord } from '@/lib/data/gallery-shared';
import { fetchCsrfToken, deleteWithCsrf } from '@/lib/auth/csrf-client';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: GalleryRecord }
  | null;

export default function AdminGalleryTable({ gallery: initialGallery }: { gallery: GalleryRecord[] }) {
  const router = useRouter();
  const [gallery, setGallery] = useState(initialGallery);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSaved(record: GalleryRecord) {
    setGallery((prev) => {
      const index = prev.findIndex((entry) => entry.id === record.id);
      if (index === -1) {
        return [...prev, record].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }
      const next = [...prev];
      next[index] = record;
      return next.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });
    setModal(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const item = deleteTarget;
    setBusyId(item.id);
    setDeleteError(null);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(`/api/admin/gallery/${item.id}`, csrf);
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Failed to delete gallery image');
        return;
      }
      setGallery((prev) => prev.filter((entry) => entry.id !== item.id));
      if (modal?.mode === 'edit' && modal.item.id === item.id) {
        setModal(null);
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError('Failed to delete gallery image');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-staff__toolbar">
        <p>{gallery.length} gallery image{gallery.length === 1 ? '' : 's'}</p>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setModal({ mode: 'create' })}
        >
          + Add Image
        </button>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gallery.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin__table-empty">
                  No gallery images yet. Upload the first image for the club page.
                </td>
              </tr>
            ) : (
              gallery.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imageUrl ? (
                      <div className="admin-gallery__thumb">
                        <MediaImage
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="92px"
                          style={{ objectFit: 'cover' }}
                          fallbackSrc=""
                        />
                      </div>
                    ) : (
                      <div className="admin-gallery__thumb admin-gallery__thumb--empty" />
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.category || '—'}</td>
                  <td>{item.sortOrder ?? 0}</td>
                  <td>
                    <div className="admin-videos__actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setModal({ mode: 'edit', item })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm admin-videos__delete"
                        disabled={busyId === item.id}
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(item);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AdminGalleryModal
          mode={modal.mode}
          item={modal.mode === 'edit' ? modal.item : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <AdminConfirmDialog
          title="Delete gallery image?"
          message={`"${deleteTarget.title}" will be removed from the club gallery. This cannot be undone.`}
          confirmLabel="Delete image"
          busy={busyId === deleteTarget.id}
          error={deleteError}
          onCancel={() => {
            if (busyId) return;
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
