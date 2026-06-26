import { createServiceClient } from '@/lib/db/supabase/server';
import { isSupabaseApiConfigured } from '@/lib/db/env';

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: row.id as string,
    actorId: (row.actor_id as string) ?? null,
    actorEmail: (row.actor_email as string) ?? null,
    action: row.action as string,
    resource: (row.resource as string) ?? null,
    resourceId: (row.resource_id as string) ?? null,
    ipAddress: (row.ip_address as string) ?? null,
    userAgent: (row.user_agent as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

export async function listAuditLogs(options: {
  limit?: number;
  offset?: number;
} = {}): Promise<AuditLogEntry[]> {
  if (!isSupabaseApiConfigured()) return [];

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}
