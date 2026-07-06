'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAcademyFacilityModal from '@/components/admin/AdminAcademyFacilityModal';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import MediaImage from '@/components/common/MediaImage';
import type { AcademyFacilitiesSection, AcademyFacility } from '@/types';
import type { AcademyFacilitySettings } from '@/types';
import { fetchCsrfToken, deleteWithCsrf, patchWithCsrf } from '@/lib/auth/csrf-client';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; item: AcademyFacility }
  | null;

interface Props {
  initialSection: AcademyFacilitiesSection;
}

export default function AdminAcademyFacilitiesPanel({ initialSection }: Props) {
  const router = useRouter();
  const [sectionLabel, setSectionLabel] = useState(initialSection.sectionLabel);
  const [sectionHeading, setSectionHeading] = useState(initialSection.sectionHeading);
  const [facilities, setFacilities] = useState(initialSection.facilities);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademyFacility | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSettingsBusy(true);
    setSettingsError('');
    setSettingsSaved(false);

    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ settings?: AcademyFacilitySettings; error?: string }>(
        '/api/admin/academy-facilities/settings',
        { sectionLabel, sectionHeading },
        csrf,
      );
      if (!ok || !data.settings) {
        setSettingsError(typeof data.error === 'string' ? data.error : 'Failed to save section settings');
        return;
      }
      setSectionLabel(data.settings.sectionLabel);
      setSectionHeading(data.settings.sectionHeading);
      setSettingsSaved(true);
      router.refresh();
    } catch {
      setSettingsError('Failed to save section settings');
    } finally {
      setSettingsBusy(false);
    }
  }

  function handleSaved(facility: AcademyFacility) {
    setFacilities((prev) => {
      const index = prev.findIndex((entry) => entry.id === facility.id);
      if (index === -1) {
        return [...prev, facility].sort((a, b) => a.sortOrder - b.sortOrder);
      }
      const next = [...prev];
      next[index] = facility;
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
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/academy-facilities/${item.id}`,
        csrf,
      );
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Failed to delete facility');
        return;
      }
      setFacilities((prev) => prev.filter((entry) => entry.id !== item.id));
      if (modal?.mode === 'edit' && modal.item.id === item.id) {
        setModal(null);
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError('Failed to delete facility');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <section className="admin-dash__panel" style={{ marginBottom: '2rem' }}>
        <h2 className="admin-dash__panel-title">Section Headings</h2>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          These appear above the facilities grid on the Academy page.
        </p>
        <form className="admin-player-form" onSubmit={handleSaveSettings}>
          {settingsError && <div className="admin-player-form__error">{settingsError}</div>}
          {settingsSaved && <div className="form__success">Section headings saved.</div>}
          <div className="admin-player-form__grid">
            <div className="form__group">
              <label className="form__label" htmlFor="sectionLabel">Label</label>
              <input
                id="sectionLabel"
                className="form__input"
                value={sectionLabel}
                onChange={(e) => setSectionLabel(e.target.value)}
                required
              />
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="sectionHeading">Heading</label>
              <input
                id="sectionHeading"
                className="form__input"
                value={sectionHeading}
                onChange={(e) => setSectionHeading(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="admin-player-form__actions">
            <button type="submit" className="btn btn--primary btn--sm" disabled={settingsBusy}>
              {settingsBusy ? 'Saving…' : 'Save Headings'}
            </button>
          </div>
        </form>
      </section>

      <div className="admin-staff__toolbar">
        <p>{facilities.length} facilit{facilities.length === 1 ? 'y' : 'ies'}</p>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setModal({ mode: 'create' })}
        >
          + Add Facility
        </button>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilities.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin__table-empty">
                  No facilities yet. Add your first facility card for the Academy page.
                </td>
              </tr>
            ) : (
              facilities.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-videos__thumb" style={{ position: 'relative', width: 80, height: 48 }}>
                      <MediaImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    </div>
                  </td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.sortOrder}</td>
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
        <AdminAcademyFacilityModal
          mode={modal.mode}
          item={modal.mode === 'edit' ? modal.item : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <AdminConfirmDialog
          title="Delete facility?"
          message={`Remove "${deleteTarget.name}" from the Academy facilities section?`}
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
