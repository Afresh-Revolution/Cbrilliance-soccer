import { getVideos } from '@/lib/data/queries';

export default async function AdminVideosPage() {
  const videos = await getVideos();

  return (
    <>
      <div className="admin__header">
        <h1>Video Management</h1>
      </div>

      <table className="admin__table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Player</th>
            <th>Duration</th>
            <th>Featured</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id}>
              <td>{v.title}</td>
              <td>{v.playerName || '—'}</td>
              <td>{v.duration}</td>
              <td>{v.featured ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
