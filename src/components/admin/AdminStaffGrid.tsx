'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ClubStaffRecord } from '@/lib/data/staff-admin';
import { fetchCsrfToken, deleteWithCsrf } from '@/lib/auth/csrf-client';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';

function StaffAvatar({ member }: { member: ClubStaffRecord }) {
  const initial = member.name.trim().charAt(0).toUpperCase() || '?';

  if (member.photo) {
    return (
      <Image
        src={member.photo}
        alt={member.name}
        width={56}
        height={56}
        className="admin-staff__avatar-img"
      />
    );
  }

  return <span className="admin-staff__avatar-fallback">{initial}</span>;
}

export default function AdminStaffGrid({ staff: initialStaff }: { staff: ClubStaffRecord[] }) {
  const router = useRouter();
  const [staff, setStaff] = useState(initialStaff);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClubStaffRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!deleteTarget) return;

    const member = deleteTarget;
    setBusyId(member.id);
    setDeleteError(null);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/staff/${member.id}`,
        csrf,
      );
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Failed to delete staff member');
        return;
      }
      setStaff((prev) => prev.filter((s) => s.id !== member.id));
      setDeleteTarget(null);
      router.refresh();
    } catch {
      setDeleteError('Failed to delete staff member');
    } finally {
      setBusyId(null);
    }
  }

  function openDeleteDialog(member: ClubStaffRecord) {
    setDeleteError(null);
    setDeleteTarget(member);
  }

  function closeDeleteDialog() {
    if (busyId) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  return (
    <>
      <div className="admin-staff__toolbar">
        <p>{staff.length} staff member{staff.length === 1 ? '' : 's'}</p>
        <Link href="/admin/staff/new" className="btn btn--primary btn--sm">
          + Add Staff Member
        </Link>
      </div>

      {staff.length === 0 ? (
        <p className="admin-staff__empty">
          No staff records yet. Add your first team member to get started.
        </p>
      ) : (
        <div className="admin-staff__grid">
          {staff.map((member) => (
            <article key={member.id} className="admin-staff__card">
              <div className="admin-staff__avatar">
                <StaffAvatar member={member} />
              </div>
              <div className="admin-staff__body">
                <h2 className="admin-staff__name">{member.name}</h2>
                <p className="admin-staff__role">{member.role}</p>
                {member.bio && <p className="admin-staff__bio">{member.bio}</p>}
              </div>
              <div className="admin-staff__actions">
                <Link
                  href={`/admin/staff/${member.id}/edit`}
                  className="btn btn--outline btn--sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn--outline btn--sm admin-staff__delete"
                  disabled={busyId === member.id}
                  onClick={() => openDeleteDialog(member)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {deleteTarget && (
        <AdminConfirmDialog
          title="Remove staff member?"
          message={`${deleteTarget.name} will be removed from the club staff page. This cannot be undone.`}
          confirmLabel="Remove"
          busy={busyId === deleteTarget.id}
          error={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
