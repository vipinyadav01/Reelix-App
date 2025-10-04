import React, { useEffect } from 'react';
import { useNotificationsSimple as useNotifications } from '@/hooks/useNotificationsSimple';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const { scheduleTestNotification, addNotification } = useNotifications();

  useEffect(() => {
    const initializeSampleNotifications = async () => {
      // Add some initial sample notifications after a short delay
      setTimeout(() => {
        // Add welcome notification
        addNotification({
          title: "Welcome to Reelix! 🎉",
          body: "Start creating amazing content and connect with others",
          type: 'system',
        });
      }, 1000);

      // Add a follow notification
      setTimeout(() => {
        addNotification({
          title: "Emma Wilson started following you",
          body: "You have a new follower",
          type: 'follow',
        });
      }, 3000);

      // Add a like notification
      setTimeout(() => {
        addNotification({
          title: "Sarah Johnson liked your post",
          body: "Your video 'Amazing sunset views' received a like",
          type: 'like',
        });
      }, 5000);
    };

    initializeSampleNotifications();
  }, [addNotification]);

  return <>{children}</>;
}
