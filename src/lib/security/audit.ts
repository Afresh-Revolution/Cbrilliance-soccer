import { createServiceClient } from '@/lib/db/supabase/server';
import { isSupabaseServiceConfigured } from '@/lib/db/env';
import { getClientIp } from '@/lib/security/rate-limit';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.credentials_updated'
  | 'upload.presign'
  | 'form.contact'
  | 'form.academy'
  | 'form.scout'
  | 'admin.access_denied'
  | 'player.create'
  | 'player.update'
  | 'player.delete'
  | 'news.create'
  | 'news.update'
  | 'news.delete'
  | 'video.create'
  | 'video.update'
  | 'video.delete'
  | 'application.update'
  | 'inquiry.update'
  | 'inquiry.delete'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete';

interface AuditParams {
  action: AuditAction;
  actorId?: string | null;
  actorEmail?: string | null;
  resource?: string;
  resourceId?: string;
  request?: Request;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  if (!isSupabaseServiceConfigured()) return;

  try {
    const supabase = await createServiceClient();
    await supabase.from('audit_logs').insert({
      actor_id: params.actorId ?? null,
      actor_email: params.actorEmail ?? null,
      action: params.action,
      resource: params.resource ?? null,
      resource_id: params.resourceId ?? null,
      ip_address: params.request ? getClientIp(params.request) : null,
      user_agent: params.request?.headers.get('user-agent') ?? null,
      metadata: params.metadata ?? {},
    });
  } catch {
    // Audit failures must not break primary flows.
  }
}
