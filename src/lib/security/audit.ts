import { createServiceClient } from '@/lib/db/supabase/server';
import { isSupabaseServiceConfigured } from '@/lib/db/env';
import { getClientIp } from '@/lib/security/rate-limit';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.credentials_updated'
  | 'upload.direct'
  | 'form.contact'
  | 'form.academy'
  | 'form.scout'
  | 'form.tournament'
  | 'form.shop_order'
  | 'shop_order.update'
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
  | 'tournament.update'
  | 'tournament.delete'
  | 'tournament.email_resend'
  | 'tournament.bank_details_update'
  | 'inquiry.update'
  | 'inquiry.delete'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'
  | 'gallery.create'
  | 'gallery.update'
  | 'gallery.delete'
  | 'shop_product.create'
  | 'shop_product.update'
  | 'shop_product.delete'
  | 'fixture.create'
  | 'fixture.update'
  | 'fixture.delete'
  | 'activity.create'
  | 'activity.update'
  | 'activity.delete'
  | 'academy_facility.create'
  | 'academy_facility.update'
  | 'academy_facility.delete'
  | 'academy_facility.settings_update';

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
