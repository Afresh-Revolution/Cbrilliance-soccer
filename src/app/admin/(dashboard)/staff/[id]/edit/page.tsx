import { notFound } from 'next/navigation';
import StaffForm from '@/components/admin/StaffForm';
import { requireAdminUuid } from '@/lib/admin/params';
import { getStaffById, staffToFormValues } from '@/lib/data/staff-admin';

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditStaffPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = requireAdminUuid(rawId);
  const member = await getStaffById(id);
  if (!member) notFound();

  return (
    <>
      <div className="admin__header">
        <h1>Edit Staff Member</h1>
        <p className="text-muted">{member.name}</p>
      </div>
      <StaffForm mode="edit" initial={staffToFormValues(member)} staffId={member.id} />
    </>
  );
}
