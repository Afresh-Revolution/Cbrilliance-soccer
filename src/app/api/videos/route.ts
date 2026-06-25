import { NextRequest, NextResponse } from 'next/server';
import { getVideos } from '@/lib/data/queries';
import { videosQuerySchema } from '@/lib/validators/schemas';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`videos-get:${ip}`, 120, 60 * 1000);
  if (!limited.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = videosQuerySchema.safeParse({
    position: searchParams.get('position') ?? undefined,
    ageCategory: searchParams.get('ageCategory') ?? undefined,
    featured: searchParams.get('featured') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const videos = await getVideos({
    position: parsed.data.position,
    ageCategory: parsed.data.ageCategory,
    featured: parsed.data.featured === 'true' ? true : parsed.data.featured === 'false' ? false : undefined,
  });

  return NextResponse.json(videos);
}
