import { handleCors } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { errorResponse, successResponse } from '../_shared/errors.ts';
import { nanoid } from 'https://esm.sh/nanoid@5';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    if (req.method === 'POST') {
      const { snapshotJson, snapshotVersion, taxCoreVersion } = await req.json();

      if (!snapshotJson || !snapshotVersion || !taxCoreVersion) {
        return errorResponse('VALIDATION_ERROR', 400, {
          message: 'snapshotJson, snapshotVersion, taxCoreVersion required',
        });
      }

      const supabase = createServiceClient();
      const token = nanoid(8);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      // Trích xuất user nếu có auth header
      let createdBy: string | null = null;
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        createdBy = user?.id ?? null;
      }

      const { error } = await supabase.from('share_snapshots').insert({
        token,
        snapshot_json: snapshotJson,
        snapshot_version: snapshotVersion,
        tax_core_version: taxCoreVersion,
        created_by: createdBy,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        console.error({ error }, 'Share insert failed');
        return errorResponse('SERVER_ERROR', 500);
      }

      console.info({ token, createdBy }, 'Share created');
      return successResponse({ token });
    }

    return errorResponse('VALIDATION_ERROR', 405, { message: 'Method not allowed' });
  } catch (err) {
    console.error({ error: err }, 'Share function error');
    return errorResponse('SERVER_ERROR', 500);
  }
});
