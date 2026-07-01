import AdminGalleryTable from '@/components/admin/AdminGalleryTable';
import { getAllGallery } from '@/lib/data/gallery-admin';

export default async function AdminGalleryPage() {
  const gallery = await getAllGallery();

  return (
    <>
      <div className="admin__header">
        <h1>Gallery</h1>
        <p className="text-muted">Manage club gallery images shown on the public site</p>
      </div>
      <AdminGalleryTable gallery={gallery} />
    </>
  );
}
