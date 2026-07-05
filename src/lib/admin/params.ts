import { notFound } from 'next/navigation';
import { parseUuidParam } from '@/lib/security/params';

/** Reject manually typed non-UUID resource ids (e.g. /admin/players/1/edit). */
export function requireAdminUuid(id: string): string {
  const uuid = parseUuidParam(id);
  if (!uuid) notFound();
  return uuid;
}
