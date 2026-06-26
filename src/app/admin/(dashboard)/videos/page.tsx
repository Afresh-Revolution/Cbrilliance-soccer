import AdminVideosTable from '@/components/admin/AdminVideosTable';
import { getAllVideos } from '@/lib/data/video-admin';

export default async function AdminVideosPage() {
  const videos = await getAllVideos();

  return (
    <>
      <div className="admin__header">
        <h1>Video Management</h1>
        <p className="text-muted">Manage scouting footage, highlights, and training clips</p>
      </div>

      <AdminVideosTable videos={videos} />
    </>
  );
}
