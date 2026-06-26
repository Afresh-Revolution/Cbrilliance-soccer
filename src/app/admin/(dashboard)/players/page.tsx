import { getPlayers } from '@/lib/data/queries';
import AdminPlayersTable from '@/components/admin/AdminPlayersTable';

export default async function AdminPlayersPage() {
  const players = await getPlayers();

  return (
    <>
      <div className="admin__header">
        <h1>Players</h1>
        <p className="text-muted">Manage player profiles, status, and statistics</p>
      </div>

      <AdminPlayersTable players={players} />
    </>
  );
}
