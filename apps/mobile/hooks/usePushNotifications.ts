import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/utils/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAppStore } from '@/stores/useAppStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as Notifications.NotificationBehavior),
});

export function usePushNotifications() {
  const { session } = useAuthStore();
  const { hasAskedPush, setHasAskedPush } = useAppStore();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id && hasAskedPush) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          setExpoPushToken(token);
          saveTokenToSupabase(token, session.user.id);
        }
      });
    }
  }, [session, hasAskedPush]);

  async function requestPermissionsIfFirstTime() {
    if (hasAskedPush) return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    setHasAskedPush(true);
    
    if (finalStatus === 'granted') {
      const token = await registerForPushNotificationsAsync();
      if (token && session?.user?.id) {
        setExpoPushToken(token);
        saveTokenToSupabase(token, session.user.id);
      }
      return true;
    }
    
    return false;
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        return null;
      }
      try {
        // FCM token or APNs token
        token = (await Notifications.getDevicePushTokenAsync()).data;
      } catch (e) {
        console.error('Error getting physical push token', e);
      }
    }

    return token;
  }

  async function saveTokenToSupabase(token: string, userId: string) {
    let deviceId = 'unknown';
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // In a real app we might use expo-application's getIosIdForVendorAsync or getAndroidId
      // For deduplication, let's just use something simple or a stored UUID if absent
      deviceId = `${Platform.OS}-${Device.modelName || 'device'}`;
    }

    try {
      await supabase.from('push_tokens').upsert(
        {
          user_id: userId,
          token: token,
          platform: Platform.OS,
          device_id: deviceId,
        },
        {
          onConflict: 'user_id, device_id',
        }
      );
    } catch (e) {
      console.error('Failed to sync push token', e);
    }
  }

  return {
    expoPushToken,
    requestPermissionsIfFirstTime,
  };
}
