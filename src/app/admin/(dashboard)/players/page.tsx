import { getAllPlayers } from '@/lib/data/player-admin';
import AdminPlayersTable from '@/components/admin/AdminPlayersTable';

export const dynamic = 'force-dynamic';

export default async function AdminPlayersPage() {
  const players = await getAllPlayers();

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
