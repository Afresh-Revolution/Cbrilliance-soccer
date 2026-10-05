import { NextRequest } from 'next/server';
import { guardPublicPost, jsonError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { removeTournamentPlayer } from '@/lib/data/tournament';
import { isTournamentAccessToken, tournamentErrorResponse } from '@/lib/tournament/errors';

type RouteContext = { params: Promise<{ token: string; id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardPublicPost(request, 'tournament-squad-player-delete', 40, 60 * 60 * 1000);
  if (blocked) return blocked;

  const { token, id } = await context.params;
  if (!isTournamentAccessToken(token)) {
    return jsonError('Registration not found.', 404);
  }
  const invalid = rejectInvalidUuid(id);
  if (invalid) return invalid;

  try {
    await removeTournamentPlayer(token, id);
    return Response.json({ success: true });
  } catch (error) {
    const mapped = tournamentErrorResponse(error);
    return jsonError(mapped.message, mapped.status);
  }
}
