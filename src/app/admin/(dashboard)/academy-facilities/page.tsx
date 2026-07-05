import AdminAcademyFacilitiesPanel from '@/components/admin/AdminAcademyFacilitiesPanel';
import { getAcademyFacilitiesSection } from '@/lib/data/academy-facility-admin';

export default async function AdminAcademyFacilitiesPage() {
  const section = await getAcademyFacilitiesSection();

  return (
    <>
      <div className="admin__header">
        <h1>Academy Facilities</h1>
        <p className="text-muted">Manage the facilities section on the public Academy page</p>
      </div>
      <AdminAcademyFacilitiesPanel initialSection={section} />
    </>
  );
}
