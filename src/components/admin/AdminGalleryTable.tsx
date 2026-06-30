'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GalleryRecord } from '@/lib/data/gallery-admin';
import { fetchCsrfToken, deleteWithCsrf } from '@/lib/auth/csrf-client';

export default function AdminGalleryTable({ gallery: initialGallery }: { gallery: GalleryRecord[] }) {
  const router = useRouter();
  const [gallery, setGallery] = useState(initialGallery);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(item: GalleryRecord) {
    if (!confirm(`Delete "${item.title}" from the club gallery? This cannot be undone.`)) return;

    setBusyId(item.id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(`/api/admin/gallery/${item.id}`, csrf);
      if (!ok) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to delete gallery image');
        return;
      }
      setGallery((prev) => prev.filter((entry) => entry.id !== item.id));
      router.refresh();
    } catch {
      alert('Failed to delete gallery image');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-staff__toolbar">
        <p>{gallery.length} gallery image{gallery.length === 1 ? '' : 's'}</p>
        <Link href="/admin/gallery/new" className="btn btn--primary btn--sm">
          + Add Image
        </Link>
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
                      <div style={{ width: 92, height: 56, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                        <Image src={item.imageUrl} alt={item.title} fill sizes="92px" style={{ objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ width: 92, height: 56, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }} />
                    )}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.category || '—'}</td>
                  <td>{item.sortOrder ?? 0}</td>
                  <td>
                    <div className="admin-videos__actions">
                      <Link href={`/admin/gallery/${item.id}/edit`} className="btn btn--outline btn--sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm admin-videos__delete"
                        disabled={busyId === item.id}
                        onClick={() => handleDelete(item)}
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
    </>
  );
}
