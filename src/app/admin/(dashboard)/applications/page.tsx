export default function AdminApplicationsPage() {
  return (
    <>
      <div className="admin__header">
        <h1>Academy Applications</h1>
        <p className="text-muted">Review and manage academy registration submissions</p>
      </div>

      <div className="admin__table-wrap">
      <table className="admin__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Email</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', color: '#B8B8B8' }}>
              Applications will appear here when submitted via the academy form (requires Supabase connection).
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </>
  );
}
