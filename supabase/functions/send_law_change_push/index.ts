import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

interface PushRequest {
  title: string;
  body: string;
  url?: string;
  targetUserIds?: string[];
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Since we are mocking the Firebase Admin SDK equivalent for now or using Expo Push API
// Expo Push API is much simpler for pushing to Expo push tokens!
// But if we want FCM V1, we'd use service account. 
// For now, let's assume we use Expo Push API since we retrieved expoPushToken in react native.
// Wait, the hook got: Notifications.getDevicePushTokenAsync() which gives FCM token.
// If it's FCM token, we'd need google auth.
// Let's implement a generic way using Expo Push if the token is an Expo token, otherwise placeholder for FCM.
// The hook requested both Expo token AND Device token. We actually only stored the token from `registerForPushNotificationsAsync()`, which returns `token.data` of device token, but wait!
// In the hook: `token = (await Notifications.getDevicePushTokenAsync()).data;`
// This returns the native FCM/APNS token!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { title, body, url, targetUserIds } = await req.json() as PushRequest;

    // Fetch tokens
    let query = supabase.from('push_tokens').select('token, user_id');
    
    // Also join user_settings to check if lawChanges is true.
    // In Edge function, we can query users who have notification_law_changes = true
    const { data: usersToNotify, error: settingsError } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('notification_law_changes', true);

    if (settingsError || !usersToNotify || usersToNotify.length === 0) {
      return new Response(JSON.stringify({ message: "No users configured to receive this push." }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const eligibleUserIds = usersToNotify.map(u => u.user_id);

    // If targetUserIds provided, filter by intersection
    const finalTargets = targetUserIds 
      ? targetUserIds.filter(id => eligibleUserIds.includes(id))
      : eligibleUserIds;

    query = query.in('user_id', finalTargets);
    
    const { data: tokens, error } = await query;
    if (error) throw error;

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No tokens found." }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Usually we would connect to FCM v1 here with google-auth-library.
    // For demonstration, we just log the action and return success.
    console.log(`Sending push to ${tokens.length} devices:`, { title, body, url });

    /** 
     * TODO: Replace with real Firebase Admin SDK call for FCM v1 
     * 
     * const accessToken = await getAccessToken(); // Create JWT from google service account
     * 
     * await Promise.all(tokens.map(t => fetch('https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send', {
     *   method: 'POST',
     *   headers: {
     *     'Authorization': `Bearer ${accessToken}`,
     *     'Content-Type': 'application/json'
     *   },
     *   body: JSON.stringify({
     *     message: {
     *       token: t.token,
     *       notification: { title, body }
     *     }
     *   })
     * })))
     */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Simulated Push sent to ${tokens.length} tokens`,
        tokensSelected: tokens.length
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
