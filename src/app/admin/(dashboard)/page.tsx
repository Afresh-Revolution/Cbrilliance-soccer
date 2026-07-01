import { getAdminDashboard } from '@/lib/data/admin-queries';
import { getPlayers } from '@/lib/data/queries';
import {
  AdminApplicationsPanel,
  AdminGalleryPanel,
  AdminInquiriesPanel,
  AdminQuickActions,
  AdminRecentPlayersTable,
  AdminStatsGrid,
  AdminStatusDistribution,
} from '@/components/admin/AdminDashboardPanels';

export default async function AdminDashboardPage() {
  const [dashboard, players] = await Promise.all([getAdminDashboard(), getPlayers()]);

  return (
    <>
      <div className="admin__header">
        <h1>Dashboard</h1>
        <p className="text-muted">Overview of players, inquiries, content, and club operations</p>
      </div>

      <AdminStatsGrid stats={dashboard.stats} />

      <div className="admin-dash__grid admin-dash__grid--2">
        <AdminInquiriesPanel items={dashboard.recentInquiries} />
        <AdminApplicationsPanel items={dashboard.recentApplications} />
      </div>

      <div className="admin-dash__grid admin-dash__grid--2">
        <AdminStatusDistribution rows={dashboard.playerStatusDistribution} />
        <AdminGalleryPanel items={dashboard.recentGallery} />
      </div>

      <AdminQuickActions />
      <AdminRecentPlayersTable players={players} />
    </>
  );
}