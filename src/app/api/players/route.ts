import { NextRequest, NextResponse } from 'next/server';
import { getPlayers } from '@/lib/data/queries';
import { playersQuerySchema } from '@/lib/validators/schemas';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`players-get:${ip}`, 120, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = playersQuerySchema.safeParse({
    search: searchParams.get('search') ?? undefined,
    position: searchParams.get('position') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    featured: searchParams.get('featured') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const players = await getPlayers({
    search: parsed.data.search,
    position: parsed.data.position,
    status: parsed.data.status,
    featured: parsed.data.featured === 'true' ? true : parsed.data.featured === 'false' ? false : undefined,
  });

  return NextResponse.json(players);
}
