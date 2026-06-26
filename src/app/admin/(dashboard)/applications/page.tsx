import AdminApplicationsTable from '@/components/admin/AdminApplicationsTable';
import { getAllApplications } from '@/lib/data/application-admin';

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();

  return (
    <>
      <div className="admin__header">
        <h1>Academy Applications</h1>
        <p className="text-muted">Review and manage academy registration submissions</p>
      </div>

      <AdminApplicationsTable applications={applications} />
    </>
  );
}
