import { NextRequest, NextResponse } from 'next/server';
import { shopOrderSchema } from '@/lib/validators/schemas';
import { isSupabaseServiceConfigured } from '@/lib/db/env';
import { guardPublicPost } from '@/lib/security/api-guard';
import { sanitizeText } from '@/lib/security/sanitize';
import { writeAuditLog } from '@/lib/security/audit';
import { notifyShopOrder } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  const blocked = await guardPublicPost(request, 'shop-order', 8, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const parsed = shopOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    if (isSupabaseServiceConfigured()) {
      const { createServiceClient } = await import('@/lib/db/supabase/server');
      const supabase = await createServiceClient();
      const { error } = await supabase.from('shop_orders').insert({
        full_name: sanitizeText(data.fullName, 120),
        email: data.email.toLowerCase().trim(),
        phone: sanitizeText(data.phone, 30),
        notes: data.notes ? sanitizeText(data.notes, 1000) : null,
        items: data.items,
      });
      if (error) throw error;
    }

    await writeAuditLog({
      action: 'form.shop_order',
      resource: 'shop_orders',
      request,
      metadata: { email: data.email, itemCount: data.items.length },
    });

    notifyShopOrder({
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      notes: data.notes,
      items: data.items,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
