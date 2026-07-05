'use client';

import ActivityForm from '@/components/admin/ActivityForm';
import { activityToFormValues } from '@/lib/data/activity-shared';
import type { ActivityItem, Player } from '@/types';

interface Props {
  mode: 'create' | 'edit';
  item?: ActivityItem | null;
  players: Player[];
  onClose: () => void;
  onSaved: (activity: ActivityItem) => void;
}

export default function AdminActivityModal({ mode, item, players, onClose, onSaved }: Props) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <div className="admin-modal__head">
          <h2 id="activity-modal-title">
            {mode === 'create' ? 'Add Activity' : 'Edit Activity'}
          </h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal__body">
          <ActivityForm
            mode={mode}
            inModal
            initial={item ? activityToFormValues(item) : undefined}
            activityId={item?.id}
            players={players}
            onCancel={onClose}
            onSuccess={onSaved}
          />
        </div>
      </div>
    </div>
  );
}
