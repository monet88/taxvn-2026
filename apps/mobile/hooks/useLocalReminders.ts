import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '@/stores/useAppStore';

const TAX_DEADLINES = [
  { id: 'tax-q1', title: 'Hạn chót thuế Quý 1', body: 'Ngày 30/04 là hạn chót nộp tờ khai thuế Quý 1.', month: 3, day: 30 }, // April is 0-indexed month 3
  { id: 'tax-q2', title: 'Hạn chót thuế Quý 2', body: 'Ngày 30/07 là hạn chót nộp tờ khai thuế Quý 2.', month: 6, day: 30 }, // July is 6
  { id: 'tax-q3', title: 'Hạn chót thuế Quý 3', body: 'Ngày 30/10 là hạn chót nộp tờ khai thuế Quý 3.', month: 9, day: 30 }, // October is 9
  { id: 'tax-q4', title: 'Hạn chót thuế Quý 4', body: 'Ngày 30/01 là hạn chót nộp tờ khai thuế Quý 4.', month: 0, day: 30 }, // January is 0
  { id: 'tax-annual', title: 'Hạn chót Quyết toán Thuế', body: 'Ngày 31/03 là hạn chót quyết toán thuế.', month: 2, day: 31 }, // March is 2
];

export function useLocalReminders() {
  const { notificationSettings, hasAskedPush } = useAppStore();

  useEffect(() => {
    if (!hasAskedPush) return;

    const setupReminders = async () => {
      // Clear previously scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (notificationSettings.deadlines) {
        // Schedule new ones
        for (const deadline of TAX_DEADLINES) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: deadline.title,
              body: deadline.body,
              data: { type: 'deadline' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.YEARLY,
              month: deadline.month,
              day: deadline.day,
              hour: 9,
              minute: 0,
            },
          });
        }
      }
    };

    setupReminders();
  }, [notificationSettings.deadlines, hasAskedPush]);
}
