export function tournamentErrorResponse(error: unknown): { message: string; status: number } {
  if (!(error instanceof Error)) {
    return { message: 'Internal server error', status: 500 };
  }

  switch (error.message) {
    case 'DATABASE_NOT_CONFIGURED':
    case 'REGISTRATION_CODE_FAILED':
      return {
        message: 'Tournament registration is not available yet. Please try again later.',
        status: 503,
      };
    case 'SQUAD_FULL':
      return {
        message: 'This squad already has the number of players declared on the registration.',
        status: 400,
      };
    case 'SQUAD_LOCKED':
      return {
        message: 'This squad can no longer be changed. The Tournament Committee has finished verification.',
        status: 403,
      };
    case 'SQUAD_NUMBER_TAKEN':
      return { message: 'That squad number is already used by another player.', status: 409 };
    case 'NOT_FOUND':
      return { message: 'Registration not found.', status: 404 };
    default:
      if (
        error.message.includes('next_tournament_registration_code') ||
        error.message.includes('tournament_registrations') ||
        error.message.includes('schema cache')
      ) {
        return {
          message: 'Tournament registration is not available yet. Please try again later.',
          status: 503,
        };
      }
      return { message: 'Internal server error', status: 500 };
  }
}

export function isTournamentAccessToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{20,128}$/.test(token);
}
