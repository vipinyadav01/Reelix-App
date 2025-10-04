import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  timestamp: number;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
}

const NOTIFICATIONS_STORAGE_KEY = '@notifications';
const UNREAD_COUNT_STORAGE_KEY = '@unread_count';

// Generate unique ID to prevent duplicate keys
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 1000)}`;
};

export const useNotificationsSimple = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications from storage on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
    saveUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
      }

      const storedCount = await AsyncStorage.getItem(UNREAD_COUNT_STORAGE_KEY);
      if (storedCount) {
        setUnreadCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const saveUnreadCount = async (count: number) => {
    try {
      await AsyncStorage.setItem(UNREAD_COUNT_STORAGE_KEY, count.toString());
    } catch (error) {
      console.error('Error saving unread count:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateUniqueId(),
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id);
      saveNotifications(updated);
      return updated;
    });
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  // Generate realistic sample notifications
  const generateSampleNotifications = () => {
    const sampleNotifications = [
      {
        title: "Sarah Johnson liked your post",
        body: "Your video 'Amazing sunset views' received a like",
        type: 'like' as const,
      },
      {
        title: "Mike Chen commented on your post",
        body: "Nice work! How did you capture this?",
        type: 'comment' as const,
      },
      {
        title: "Emma Wilson started following you",
        body: "You have a new follower",
        type: 'follow' as const,
      },
      {
        title: "Alex Rodriguez mentioned you",
        body: "Check out this awesome video @you",
        type: 'mention' as const,
      },
      {
        title: "Welcome to Reelix! 🎉",
        body: "Start creating amazing content and connect with others",
        type: 'system' as const,
      },
      {
        title: "Your post is trending! 🔥",
        body: "Your video has 1,000+ views in the last hour",
        type: 'system' as const,
      },
      {
        title: "David Lee liked your post",
        body: "Your video 'Morning workout routine' received a like",
        type: 'like' as const,
      },
      {
        title: "Lisa Park commented on your post",
        body: "This is so inspiring! Thank you for sharing",
        type: 'comment' as const,
      },
    ];

    // Add a random sample notification
    const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
    addNotification(randomNotification);
  };

  // Add multiple sample notifications
  const addMultipleSampleNotifications = () => {
    const sampleNotifications = [
      {
        title: "Mike Chen commented on your post",
        body: "Nice work! How did you capture this?",
        type: 'comment' as const,
      },
      {
        title: "Your post is trending! 🔥",
        body: "Your video has 1,000+ views in the last hour",
        type: 'system' as const,
      },
      {
        title: "Alex Rodriguez mentioned you",
        body: "Check out this awesome video @you",
        type: 'mention' as const,
      },
      {
        title: "David Lee liked your post",
        body: "Your video 'Morning workout routine' received a like",
        type: 'like' as const,
      },
    ];

    sampleNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification(notification);
      }, index * 500); // Stagger the notifications
    });
  };

  // Schedule a test notification (simulated)
  const scheduleTestNotification = async () => {
    generateSampleNotifications();
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
    getUnreadNotifications,
    getNotificationsByType,
    getUnreadCount: () => unreadCount,
    scheduleTestNotification,
    addMultipleSampleNotifications,
  };
};
