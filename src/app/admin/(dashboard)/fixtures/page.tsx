import AdminFixturesTable from '@/components/admin/AdminFixturesTable';
import { getAllFixtures } from '@/lib/data/fixture-admin';

export default async function AdminFixturesPage() {
  const fixtures = await getAllFixtures();

  return (
    <>
      <div className="admin__header">
        <h1>Fixtures</h1>
        <p className="text-muted">Manage match schedule and results for the professional club</p>
      </div>

      <AdminFixturesTable fixtures={fixtures} />
    </>
  );
}
