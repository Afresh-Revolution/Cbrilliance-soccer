import AdminInquiriesTable from '@/components/admin/AdminInquiriesTable';
import { getAllInquiries } from '@/lib/data/inquiry-admin';

export default async function AdminInquiriesPage() {
  const inquiries = await getAllInquiries();

  return (
    <>
      <div className="admin__header">
        <h1>Inquiry Management</h1>
        <p className="text-muted">Track scout requests, contact forms, and club inquiries</p>
      </div>

      <AdminInquiriesTable inquiries={inquiries} />
    </>
  );
}
