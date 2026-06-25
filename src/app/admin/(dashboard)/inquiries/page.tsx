export default function AdminInquiriesPage() {
  return (
    <>
      <div className="admin__header">
        <h1>Inquiry Management</h1>
        <p className="text-muted">Track scout requests, contact forms, and club inquiries</p>
      </div>

      <div className="grid grid--3 mb-lg">
        <div className="admin__stat-card">
          <h3>0</h3>
          <p>New Inquiries</p>
        </div>
        <div className="admin__stat-card">
          <h3>0</h3>
          <p>Pending</p>
        </div>
        <div className="admin__stat-card">
          <h3>0</h3>
          <p>Closed</p>
        </div>
      </div>

      <table className="admin__table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', color: '#B8B8B8' }}>
              Inquiries will appear here when submitted (requires Supabase connection).
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
