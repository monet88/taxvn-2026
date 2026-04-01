import { corsHeaders } from './cors.ts';

// Error codes matching API-12 contract
export const ErrorCode = {
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  RATE_LIMITED: 'RATE_LIMITED',
  HISTORY_NOT_FOUND: 'HISTORY_NOT_FOUND',
  SHARE_NOT_FOUND: 'SHARE_NOT_FOUND',
  SHARE_EXPIRED: 'SHARE_EXPIRED',
  VERSION_OUTDATED: 'VERSION_OUTDATED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export function errorResponse(
  code: keyof typeof ErrorCode,
  status: number,
  details?: Record<string, unknown>
): Response {
  return new Response(
    JSON.stringify({
      error: { code: ErrorCode[code], details },
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

export function successResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
