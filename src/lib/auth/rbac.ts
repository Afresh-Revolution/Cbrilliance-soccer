import type { AuthContext } from '@/lib/auth/session';
import type { UserRole } from '@/types';

export const ADMIN_ROLES: UserRole[] = ['super_admin', 'content_admin', 'academy_staff'];
export const ADMIN_ROLE_SET = new Set<UserRole>(ADMIN_ROLES);

export function roleFromAuthUser(user: {
  app_metadata?: Record<string, unknown>;
}): UserRole | null {
  const raw = user.app_metadata?.role;
  if (typeof raw === 'string' && ADMIN_ROLE_SET.has(raw as UserRole)) {
    return raw as UserRole;
  }
  return null;
}

const ADMIN_ROLES_LIST: UserRole[] = ADMIN_ROLES;

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'admin.access',
    'admin.settings',
    'content.write',
    'content.read',
    'inquiries.read',
    'inquiries.update',
    'upload.write',
  ],
  content_admin: [
    'admin.access',
    'content.write',
    'content.read',
    'inquiries.read',
    'upload.write',
  ],
  academy_staff: [
    'admin.access',
    'inquiries.read',
    'inquiries.update',
  ],
};

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES_LIST.includes(role);
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(ctx: AuthContext, permission: string): void {
  if (!hasPermission(ctx.profile.role, permission)) {
    throw new Error('FORBIDDEN');
  }
}

export function requireAdmin(ctx: AuthContext): void {
  if (!isAdminRole(ctx.profile.role)) {
    throw new Error('FORBIDDEN');
  }
}
