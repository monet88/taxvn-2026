---
wave: 2
depends_on:
  - 06-01
---
# Summary: 06-02 - Local Deadline Reminders

<status>
COMPLETED
</status>

<implementation_notes>
Implemented `useLocalReminders` hook with `expo-notifications` to schedule YEARLY triggers for Tax Deadlines (Q1, Q2, Q3, Q4, and Annual Assessment) based on the `notificationSettings.deadlines` flag. Correctly deployed on the RootLayout to re-evaluate anytime preferences or permissions change.
</implementation_notes>
