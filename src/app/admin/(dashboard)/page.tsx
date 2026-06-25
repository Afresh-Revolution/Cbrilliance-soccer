import { getPlayers, getSiteStats } from '@/lib/data/queries';

export default async function AdminDashboard() {
  const stats = await getSiteStats();
  const players = await getPlayers();

  return (
    <>
      <div className="admin__header">
        <h1>Dashboard</h1>
        <p className="text-muted">Welcome to the CBFC admin panel</p>
      </div>

      <div className="admin__stats-grid">
        <div className="admin__stat-card">
          <h3>{stats.registeredPlayers}</h3>
          <p>Registered Players</p>
        </div>
        <div className="admin__stat-card">
          <h3>{players.length}</h3>
          <p>Active Profiles</p>
        </div>
        <div className="admin__stat-card">
          <h3>{stats.scoutRequests}</h3>
          <p>Scout Requests</p>
        </div>
        <div className="admin__stat-card">
          <h3>{stats.professionalPlacements}</h3>
          <p>Pro Placements</p>
        </div>
      </div>

      <h2 className="mb-md">Recent Players</h2>
      <div className="admin__table-wrap">
        <table className="admin__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Status</th>
            <th>Nationality</th>
          </tr>
        </thead>
        <tbody>
          {players.slice(0, 5).map((p) => (
            <tr key={p.id}>
              <td>{p.fullName}</td>
              <td style={{ textTransform: 'capitalize' }}>{p.position}</td>
              <td style={{ textTransform: 'capitalize' }}>{p.status.replace(/_/g, ' ')}</td>
              <td>{p.nationality}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
