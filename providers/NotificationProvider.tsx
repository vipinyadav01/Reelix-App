import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const { scheduleTestNotification } = useNotifications();

  useEffect(() => {
    const initializeNotifications = async () => {
      setTimeout(() => {
        scheduleTestNotification();
      }, 5000);
    };

    initializeNotifications();
  }, [scheduleTestNotification]);

  return <>{children}</>;
}
