import { notFound } from 'next/navigation';
import VideoForm from '@/components/admin/VideoForm';
import { requireAdminUuid } from '@/lib/admin/params';
import { getPlayers } from '@/lib/data/queries';
import { getVideoById, videoToFormValues } from '@/lib/data/video-admin';

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditVideoPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = requireAdminUuid(rawId);
  const [video, players] = await Promise.all([getVideoById(id), getPlayers()]);
  if (!video) notFound();

  return (
    <>
      <div className="admin__header">
        <h1>Edit Video</h1>
        <p className="text-muted">{video.title}</p>
      </div>
      <VideoForm mode="edit" initial={videoToFormValues(video)} videoId={video.id} players={players} />
    </>
  );
}
