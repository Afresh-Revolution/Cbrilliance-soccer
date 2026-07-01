/** Permission required to access an admin route (null = any authenticated admin). */
export function requiredPermissionForAdminPath(pathname: string): string | null {
  const path = pathname.replace(/\/$/, '') || '/admin';

  if (path === '/admin') return null;

  if (path.startsWith('/admin/settings')) return 'admin.settings';

  if (path.startsWith('/admin/applications') || path.startsWith('/admin/inquiries')) {
    return 'inquiries.read';
  }

  const contentRoots = ['/admin/players', '/admin/news', '/admin/videos', '/admin/staff', '/admin/gallery'];
  if (contentRoots.some((root) => path.startsWith(root))) {
    if (path.endsWith('/new') || /\/[^/]+\/edit$/.test(path)) return 'content.write';
    return 'content.read';
  }

  return null;
}
