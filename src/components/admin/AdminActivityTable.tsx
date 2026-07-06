'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminActivityModal from '@/components/admin/AdminActivityModal';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import type { ActivityItem, Player } from '@/types';
import { fetchCsrfToken, deleteWithCsrf } from '@/lib/auth/csrf-client';

const TYPE_LABELS: Record<string, string> = {
  trial: 'Trial',
  achievement: 'Achievement',
  camp: 'Camp',
  club: 'Club',
  agency: 'Agency',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: ActivityItem }
  | null;

export default function AdminActivityTable({
  activities: initialActivities,
  players,
}: {
  activities: ActivityItem[];
  players: Player[];
}) {
  const router = useRouter();
  const [activities, setActivities] = useState(initialActivities);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActivityItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const playerName = (playerId?: string) =>
    players.find((p) => p.id === playerId)?.fullName ?? '—';

  function handleSaved(activity: ActivityItem) {
    setActivities((prev) => {
      const index = prev.findIndex((entry) => entry.id === activity.id);
      if (index === -1) {
        return [activity, ...prev];
      }
      const next = [...prev];
      next[index] = activity;
      return next;
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
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(`/api/admin/activity/${item.id}`, csrf);
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Failed to delete activity');
        return;
      }
      setActivities((prev) => prev.filter((entry) => entry.id !== item.id));
      if (modal?.mode === 'edit' && modal.item.id === item.id) {
        setModal(null);
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError('Failed to delete activity');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-staff__toolbar">
        <p>{activities.length} activit{activities.length === 1 ? 'y' : 'ies'}</p>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setModal({ mode: 'create' })}
        >
          + Add Activity
        </button>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Title</th>
              <th>Description</th>
              <th>Player</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin__table-empty">
                  No activity items yet. Add your first update for the homepage feed.
                </td>
              </tr>
            ) : (
              activities.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <span className="admin-videos__position">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </span>
                  </td>
                  <td><strong>{item.title}</strong></td>
                  <td className="admin-players__stats">{item.description || '—'}</td>
                  <td>{playerName(item.playerId)}</td>
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
        <AdminActivityModal
          mode={modal.mode}
          item={modal.mode === 'edit' ? modal.item : null}
          players={players}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <AdminConfirmDialog
          title="Delete activity?"
          message={`Remove "${deleteTarget.title}" from the activity feed?`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => {
            if (busyId) return;
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          busy={busyId === deleteTarget.id}
          error={deleteError}
        />
      )}
    </>
  );
}
