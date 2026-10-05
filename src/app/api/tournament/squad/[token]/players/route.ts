import { NextRequest, NextResponse } from 'next/server';
import { tournamentPlayerSchema } from '@/lib/validators/schemas';
import { guardPublicPost, jsonError } from '@/lib/security/api-guard';
import { addTournamentPlayer } from '@/lib/data/tournament';
import { isTournamentAccessToken, tournamentErrorResponse } from '@/lib/tournament/errors';

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const blocked = await guardPublicPost(request, 'tournament-squad-player', 40, 60 * 60 * 1000);
  if (blocked) return blocked;

  const { token } = await context.params;
  if (!isTournamentAccessToken(token)) {
    return jsonError('Registration not found.', 404);
  }

  try {
    const body = await request.json();
    const parsed = tournamentPlayerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Check the player details and try again.';
      return jsonError(message, 400);
    }

    const player = await addTournamentPlayer(token, parsed.data.fullName, parsed.data.squadNumber);
    return NextResponse.json({ player });
  } catch (error) {
    const mapped = tournamentErrorResponse(error);
    return jsonError(mapped.message, mapped.status);
  }
}
