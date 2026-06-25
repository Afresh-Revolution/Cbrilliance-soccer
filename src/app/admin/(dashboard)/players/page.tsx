import { getPlayers } from '@/lib/data/queries';
import { POSITION_LABELS, STATUS_LABELS } from '@/lib/constants/navigation';
import Link from 'next/link';

export default async function AdminPlayersPage() {
  const players = await getPlayers();

  return (
    <>
      <div className="admin__header">
        <h1>Player Management</h1>
        <Link href="/admin/players/new" className="btn btn--primary btn--sm">Add Player</Link>
      </div>

      <div className="admin__table-wrap">
      <table className="admin__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Status</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id}>
              <td>{p.fullName}</td>
              <td>{POSITION_LABELS[p.position]}</td>
              <td>{STATUS_LABELS[p.status]}</td>
              <td>{p.age}</td>
              <td>
                <Link href={`/admin/players/${p.id}`} className="btn btn--outline btn--sm">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
