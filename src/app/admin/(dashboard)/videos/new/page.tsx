import VideoForm from '@/components/admin/VideoForm';
import { getPlayers } from '@/lib/data/queries';

export default async function AdminNewVideoPage() {
  const players = await getPlayers();

  return (
    <>
      <div className="admin__header">
        <h1>Add Video</h1>
        <p className="text-muted">Upload a new video for the CBFC video hub</p>
      </div>
      <VideoForm mode="create" players={players} />
    </>
  );
}
