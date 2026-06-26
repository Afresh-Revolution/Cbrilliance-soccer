import AdminStaffGrid from '@/components/admin/AdminStaffGrid';
import { getAllStaff } from '@/lib/data/staff-admin';

export default async function AdminStaffPage() {
  const staff = await getAllStaff();

  return (
    <>
      <div className="admin__header">
        <h1>Coaching Staff</h1>
        <p className="text-muted">Manage club staff and coaching team profiles</p>
      </div>

      <AdminStaffGrid staff={staff} />
    </>
  );
}
