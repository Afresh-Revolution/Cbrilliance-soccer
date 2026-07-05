'use client';

import AcademyFacilityForm from '@/components/admin/AcademyFacilityForm';
import { academyFacilityToFormValues } from '@/lib/data/academy-facility-shared';
import type { AcademyFacility } from '@/types';

interface Props {
  mode: 'create' | 'edit';
  item?: AcademyFacility | null;
  onClose: () => void;
  onSaved: (facility: AcademyFacility) => void;
}

export default function AdminAcademyFacilityModal({ mode, item, onClose, onSaved }: Props) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="facility-modal-title">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__head">
          <h2 id="facility-modal-title">
            {mode === 'create' ? 'Add Facility' : 'Edit Facility'}
          </h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal__body">
          <AcademyFacilityForm
            mode={mode}
            inModal
            initial={item ? academyFacilityToFormValues(item) : undefined}
            facilityId={item?.id}
            onCancel={onClose}
            onSuccess={onSaved}
          />
        </div>
      </div>
    </div>
  );
}
