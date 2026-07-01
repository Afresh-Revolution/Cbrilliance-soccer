import Link from 'next/link';
import Image from 'next/image';
import type {
  AdminApplicationRow,
  AdminDashboardStats,
  AdminInquiryRow,
  AdminPlayerStatusRow,
  AdminRecentPlayer,
  GalleryItem,
} from '@/types';
import { resolveMediaUrl } from '@/lib/data/cbfc-media';

function StatIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    players: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z',
    inquiries: 'M4 6h16v10H5.2L4 17.2V6Zm2 2v6h12V8H6Zm2 2h8v2H8v-2Z',
    applications: 'M4 6h6v6H4V6Zm10 0h6v6h-6V6ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    abroad: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.9 9h-3.3a15.4 15.4 0 0 0-1.2-4.6A8 8 0 0 1 19.9 11ZM12 4a13.6 13.6 0 0 1 2.3 5H9.7A13.6 13.6 0 0 1 12 4ZM8.6 6.4A15.4 15.4 0 0 0 7.4 11H4.1a8 8 0 0 1 4.5-4.6ZM4.1 13h3.3a15.4 15.4 0 0 0 1.2 4.6A8 8 0 0 1 4.1 13Zm3.5 2.6A13.6 13.6 0 0 1 12 20a13.6 13.6 0 0 1-4.4-4.4Z',
    news: 'M6 4h9l3 3v13H6V4Zm2 2v2h8V6H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z',
    videos: 'M4 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 2v8h8l4-4V8l-4-4H6Z',
    fixtures: 'M6 4h12v2H6V4Zm-2 4h16v12H4V8Zm2 2v8h12v-8H6Zm2 2h3v2H8v-2Zm5 0h3v2h-3v-2Z',
    staff: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 14.8 7.2 16.8l.9-5.3L4.2 7.7l5.4-.8L12 2Z',
    gallery: 'M4 4h16v16H4V4Zm2 2v12h12V6H6Zm1 1h4v4H7V7Zm6 0h4v4h-4V7ZM7 12h4v4H7v-4Zm6 0h4v4h-4v-4Z',
  };

  return (
    <svg className="admin-dash__stat-icon" viewBox="0 0 24 24" aria-hidden>
      <path d={paths[type] ?? paths.players} fill="currentColor" />
    </svg>
  );
}

const STAT_ITEMS: { key: keyof AdminDashboardStats; label: string; icon: string }[] = [
  { key: 'totalPlayers', label: 'Total Players', icon: 'players' },
  { key: 'activeInquiries', label: 'Active Inquiries', icon: 'inquiries' },
  { key: 'academyApplications', label: 'Academy Applications', icon: 'applications' },
  { key: 'playersAbroad', label: 'Players Abroad', icon: 'abroad' },
  { key: 'publishedNews', label: 'Published News', icon: 'news' },
  { key: 'videos', label: 'Videos', icon: 'videos' },
  { key: 'upcomingFixtures', label: 'Upcoming Fixtures', icon: 'fixtures' },
  { key: 'coachingStaff', label: 'Coaching Staff', icon: 'staff' },
  { key: 'galleryImages', label: 'Gallery Images', icon: 'gallery' },
];

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    new: 'admin-dash__badge--new',
    contacted: 'admin-dash__badge--info',
    reviewed: 'admin-dash__badge--info',
    pending: 'admin-dash__badge--gold',
    invited: 'admin-dash__badge--gold',
    closed: 'admin-dash__badge--muted',
    rejected: 'admin-dash__badge--danger',
  };
  return map[status] ?? 'admin-dash__badge--muted';
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function AdminStatsGrid({ stats }: { stats: AdminDashboardStats }) {
  return (
    <div className="admin-dash__stats">
      {STAT_ITEMS.map((item) => (
        <div key={item.key} className="admin-dash__stat">
          <StatIcon type={item.icon} />
          <p className="admin-dash__stat-label">{item.label}</p>
          <p className="admin-dash__stat-value">{stats[item.key]}</p>
        </div>
      ))}
    </div>
  );
}

function FeedList<T extends { id?: string }>({
  title,
  href,
  emptyMessage,
  items,
  renderItem,
  itemKey,
}: {
  title: string;
  href: string;
  emptyMessage: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemKey: (item: T) => string;
}) {
  return (
    <section className="admin-dash__panel">
      <div className="admin-dash__panel-head">
        <h2>{title}</h2>
        <Link href={href} className="admin-dash__panel-link">
          View all →
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="admin-dash__empty">{emptyMessage}</p>
      ) : (
        <div className="admin-dash__feed">{items.map((item) => (
          <div key={itemKey(item)}>{renderItem(item)}</div>
        ))}</div>
      )}
    </section>
  );
}

export function AdminInquiriesPanel({ items }: { items: AdminInquiryRow[] }) {
  return (
    <FeedList
      title="Recent Inquiries"
      href="/admin/inquiries"
      emptyMessage="No inquiries yet."
      items={items}
      itemKey={(item) => `${item.source}-${item.id}`}
      renderItem={(item) => (
        <div className="admin-dash__feed-item">
          <div className="admin-dash__avatar" aria-hidden>
            {initial(item.name)}
          </div>
          <div className="admin-dash__feed-body">
            <p className="admin-dash__feed-name">{item.name}</p>
            <p className="admin-dash__feed-meta">{item.subtitle}</p>
          </div>
          <span className={`admin-dash__badge ${statusBadgeClass(item.status)}`}>
            {formatStatus(item.status)}
          </span>
        </div>
      )}
    />
  );
}

export function AdminApplicationsPanel({ items }: { items: AdminApplicationRow[] }) {
  return (
    <FeedList
      title="Academy Applications"
      href="/admin/applications"
      emptyMessage="No applications yet."
      items={items}
      itemKey={(item) => item.id}
      renderItem={(item) => (
        <div className="admin-dash__feed-item">
          <div className="admin-dash__avatar" aria-hidden>
            {initial(item.name)}
          </div>
          <div className="admin-dash__feed-body">
            <p className="admin-dash__feed-name">{item.name}</p>
            <p className="admin-dash__feed-meta">{item.subtitle}</p>
          </div>
          <span className={`admin-dash__badge ${statusBadgeClass(item.status)}`}>
            {formatStatus(item.status)}
          </span>
        </div>
      )}
    />
  );
}

export function AdminGalleryPanel({ items }: { items: GalleryItem[] }) {
  return (
    <FeedList
      title="Recent Gallery Images"
      href="/admin/gallery"
      emptyMessage="No gallery images yet."
      items={items}
      itemKey={(item) => item.id}
      renderItem={(item) => (
        <div className="admin-dash__feed-item admin-dash__feed-item--gallery">
          <div className="admin-dash__gallery-thumb" aria-hidden>
            {item.imageUrl ? (
              <Image
                src={resolveMediaUrl(item.imageUrl)}
                alt={item.title}
                fill
                sizes="48px"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <StatIcon type="gallery" />
            )}
          </div>
          <div className="admin-dash__feed-body">
            <p className="admin-dash__feed-name">{item.title}</p>
            <p className="admin-dash__feed-meta">
              {item.category || 'Uncategorized'}
            </p>
          </div>
        </div>
      )}
    />
  );
}

export function AdminStatusDistribution({ rows }: { rows: AdminPlayerStatusRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <section className="admin-dash__panel">
      <h2 className="admin-dash__panel-title">Player Status Distribution</h2>
      <div className="admin-dash__bars">
        {rows.map((row) => (
          <div key={row.status} className="admin-dash__bar-row">
            <span className="admin-dash__bar-label">{row.label}</span>
            <div className="admin-dash__bar-track">
              <div
                className="admin-dash__bar-fill"
                style={{ width: `${(row.count / max) * 100}%` }}
              />
            </div>
            <span className="admin-dash__bar-count">{row.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const QUICK_ACTIONS = [
  { label: 'Add Player', href: '/admin/players/new', icon: 'players' },
  { label: 'Publish News', href: '/admin/news/new', icon: 'news' },
  { label: 'Add Video', href: '/admin/videos/new', icon: 'videos' },
  { label: 'Upload Image', href: '/admin/gallery', icon: 'gallery' },
  { label: 'Review Applications', href: '/admin/applications', icon: 'applications' },
  { label: 'Manage Staff', href: '/admin/staff/new', icon: 'staff' },
];

export function AdminQuickActions() {
  return (
    <section className="admin-dash__panel">
      <h2 className="admin-dash__panel-title">Quick Actions</h2>
      <div className="admin-dash__actions">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.label} href={action.href} className="admin-dash__action">
            <StatIcon type={action.icon} />
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function AdminRecentPlayersTable({ players }: { players: AdminRecentPlayer[] }) {
  return (
    <>
      <h2 className="admin-dash__section-title">Recent Players</h2>
      <div className="admin__table-wrap">
        {players.length === 0 ? (
          <p className="admin-dash__empty">No players yet.</p>
        ) : (
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
              {players.map((p) => (
                <tr key={p.id}>
                  <td>{p.fullName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.position}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.status.replace(/_/g, ' ')}</td>
                  <td>{p.nationality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}