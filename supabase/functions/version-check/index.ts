import { handleCors } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';
import { errorResponse, successResponse } from '../_shared/errors.ts';

interface VersionConfig {
  minimumVersion: string;
  latestVersion: string;
  effectiveDate: string;
  disabledCalculators: string[];
  updateUrl: { ios: string; android: string };
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const { clientVersion } = await req.json();

    if (!clientVersion) {
      return errorResponse('VALIDATION_ERROR', 400, { message: 'clientVersion required' });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'version_gate')
      .single();

    if (error || !data) {
      console.error({ error }, 'Version config fetch failed');
      return errorResponse('SERVER_ERROR', 500);
    }

    const config = data.value as VersionConfig;
    const isSupported = compareVersions(clientVersion, config.minimumVersion) >= 0;

    return successResponse({
      isSupported,
      updateRequired: !isSupported,
      latestVersion: config.latestVersion,
      minimumVersion: config.minimumVersion,
      disabledCalculators: config.disabledCalculators,
      updateUrl: config.updateUrl,
    });
  } catch (err) {
    console.error({ error: err }, 'Version check error');
    return errorResponse('SERVER_ERROR', 500);
  }
});
