'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShopModal from '@/components/admin/AdminShopModal';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import MediaImage from '@/components/common/MediaImage';
import type { ShopProduct } from '@/types';
import { shopCategoryLabel } from '@/lib/data/shop-shared';
import { fetchCsrfToken, deleteWithCsrf } from '@/lib/auth/csrf-client';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: ShopProduct }
  | null;

export default function AdminShopTable({ products: initialProducts }: { products: ShopProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShopProduct | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSaved(record: ShopProduct) {
    setProducts((prev) => {
      const index = prev.findIndex((entry) => entry.id === record.id);
      if (index === -1) {
        return [...prev, record].sort((a, b) => a.sortOrder - b.sortOrder);
      }
      const next = [...prev];
      next[index] = record;
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
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
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(`/api/admin/shop/${item.id}`, csrf);
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Failed to delete shop item');
        return;
      }
      setProducts((prev) => prev.filter((entry) => entry.id !== item.id));
      if (modal?.mode === 'edit' && modal.item.id === item.id) {
        setModal(null);
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError('Failed to delete shop item');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-staff__toolbar">
        <p>{products.length} shop item{products.length === 1 ? '' : 's'}</p>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setModal({ mode: 'create' })}
        >
          + Add Item
        </button>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Colors</th>
              <th>Sizes</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin__table-empty">
                  No shop items yet. Upload jerseys, shorts, socks, or boots for the Shop Now section.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imageUrl ? (
                      <div className="admin-gallery__thumb">
                        <MediaImage
                          src={item.imageUrl}
                          alt={item.name}
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
                  <td>{item.name}</td>
                  <td>{shopCategoryLabel(item.category)}</td>
                  <td>{item.colors?.length ? item.colors.map((c) => c.name).join(', ') : '—'}</td>
                  <td>{item.sizes?.length ? item.sizes.join(', ') : '—'}</td>
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
        <AdminShopModal
          mode={modal.mode}
          item={modal.mode === 'edit' ? modal.item : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <AdminConfirmDialog
          title="Delete shop item?"
          message={`"${deleteTarget.name}" will be removed from the Shop Now section. This cannot be undone.`}
          confirmLabel="Delete item"
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
