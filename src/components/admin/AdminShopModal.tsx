'use client';

import ShopProductForm from '@/components/admin/ShopProductForm';
import { shopProductToFormValues } from '@/lib/data/shop-shared';
import type { ShopProduct } from '@/types';

interface Props {
  mode: 'create' | 'edit';
  item?: ShopProduct | null;
  onClose: () => void;
  onSaved: (product: ShopProduct) => void;
}

export default function AdminShopModal({ mode, item, onClose, onSaved }: Props) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="shop-modal-title">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__head">
          <h2 id="shop-modal-title">
            {mode === 'create' ? 'Add Shop Item' : 'Edit Shop Item'}
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
          <ShopProductForm
            mode={mode}
            inModal
            initial={item ? shopProductToFormValues(item) : undefined}
            productId={item?.id}
            onCancel={onClose}
            onSuccess={onSaved}
          />
        </div>
      </div>
    </div>
  );
}
