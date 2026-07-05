import AdminActivityTable from '@/components/admin/AdminActivityTable';
import { getAllActivityItems } from '@/lib/data/activity-admin';
import { getPlayers } from '@/lib/data/queries';

export default async function AdminActivityPage() {
  const [activities, players] = await Promise.all([getAllActivityItems(), getPlayers()]);

  return (
    <>
      <div className="admin__header">
        <h1>Activity Feed</h1>
        <p className="text-muted">Manage homepage timeline updates and club announcements</p>
      </div>

      <AdminActivityTable activities={activities} players={players} />
    </>
  );
}
