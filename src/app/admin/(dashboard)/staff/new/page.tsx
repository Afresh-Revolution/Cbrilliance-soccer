import StaffForm from '@/components/admin/StaffForm';

export default function AdminNewStaffPage() {
  return (
    <>
      <div className="admin__header">
        <h1>Add Staff Member</h1>
        <p className="text-muted">Add a new coach or staff profile to the club page</p>
      </div>
      <StaffForm mode="create" />
    </>
  );
}
