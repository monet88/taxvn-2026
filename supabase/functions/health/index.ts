import { handleCors } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { successResponse, errorResponse } from '../_shared/errors.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const supabase = createServiceClient();

    // Deep health check — verify DB is accessible
    const { error } = await supabase.from('app_config').select('key').limit(1);

    if (error) {
      return successResponse({
        status: 'degraded',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      }, 503);
    }

    return successResponse({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error({ error: err }, 'Health check error');
    return errorResponse('SERVER_ERROR', 500);
  }
});
