import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { theme } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useState, useMemo, useCallback } from "react";

interface NotificationGroup {
  title: string;
  notifications: {
    id: string;
    senderId: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    timestamp: number;
  }[];
}

export default function NotificationScreen() {
  const convexNotifications = useQuery(api.notifications.getNotifications);
  const respondToFollowRequest = useMutation(api.user.respondToFollowRequest);

  const notifications = useMemo(() => {
    if (!convexNotifications) return [];
    return convexNotifications.map((n) => ({
       id: n._id,
       senderId: n.sender._id,
       title: n.sender.username,
       body: n.type === "like" ? "Liked your post" : 
             n.type === "comment" ? `Commented: ${n.comment}` : 
             n.type === "follow" ? "Started following you" : 
             n.type === "follow_request" ? "Requested to follow you" :
             n.type === "system" ? "Account update" :
             "New interaction",
       type: n.type,
       read: false, 
       timestamp: n._creationTime,
    }));
  }, [convexNotifications]);

  const handleRespond = async (senderId: string, approve: boolean) => {
    try {
      await respondToFollowRequest({ followerId: senderId as Id<"users">, approve });
      // Helper to remove item locally if needed or rely on Convex
    } catch (err) {
      console.error("Failed to respond", err);
    }
  };

  const unreadCount = notifications.length;

  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const insets = useSafeAreaInsets();

  const markAsRead = (id: string) => {
      console.log("Mark as read", id);
  };
  
  const markAllAsRead = () => {};
  const clearNotifications = () => {};

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (timestamp <= 0 || timestamp > now) return "Invalid date";
    if (diff < 5000) return "Just now";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    if (diff < 2419200000) return `${Math.floor(diff / 604800000)}w ago`;

    const date = new Date(timestamp);
    const isThisYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(isThisYear ? {} : { year: "numeric" }),
    });
  };

  const getFullTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string): { icon: string; color: string } => {
    switch (type) {
      case "like":
        return { icon: "❤️", color: "#ef4444" };
      case "comment":
        return { icon: "💬", color: "#3b82f6" };
      case "follow":
        return { icon: "👤", color: "#8b5cf6" };
      case "follow_request":
        return { icon: "👋", color: "#f59e0b" };
      case "mention":
        return { icon: "@", color: "#f59e0b" };
      case "message":
        return { icon: "✉️", color: "#10b981" };
      case "system":
        return { icon: "⚙️", color: "#6b7280" };
      default:
        return { icon: "🔔", color: theme.color.reactBlue.light };
    }
  };

  const groupedNotifications = useMemo(() => {
    try {
      const filtered =
        filter === "unread"
          ? notifications.filter((n) => !n.read)
          : notifications;
      const limited = filtered.slice(0, 100);

      const groups: NotificationGroup[] = [];
      const now = Date.now();

      const today: any[] = [];
      const yesterday: any[] = [];
      const thisWeek: any[] = [];
      const thisMonth: any[] = [];
      const older: any[] = [];

      limited.forEach((n) => {
        try {
          const diff = now - n.timestamp;
          if (diff < 86400000) today.push(n);
          else if (diff < 172800000) yesterday.push(n);
          else if (diff < 604800000) thisWeek.push(n);
          else if (diff < 2592000000) thisMonth.push(n);
          else older.push(n);
        } catch (err) {
          console.error("Error processing notification:", err);
        }
      });

      if (today.length) groups.push({ title: "Today", notifications: today });
      if (yesterday.length)
        groups.push({ title: "Yesterday", notifications: yesterday });
      if (thisWeek.length)
        groups.push({ title: "This Week", notifications: thisWeek });
      if (thisMonth.length)
        groups.push({ title: "This Month", notifications: thisMonth });
      if (older.length) groups.push({ title: "Older", notifications: older });

      return groups;
    } catch (err) {
      console.error("Error grouping notifications:", err);
      return [];
    }
  }, [notifications, filter]);

  const handleMarkAllAsRead = useCallback(() => {
    try {
      if (typeof markAllAsRead === "function") markAllAsRead();
      setShowDropdown(false);
    } catch (err) {
      console.error("Error marking all as read:", err);
      Alert.alert("Error", "Failed to mark all notifications as read");
    }
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    try {
      if (typeof clearNotifications !== "function") {
        Alert.alert("Error", "Clear function not available");
        return;
      }

      Alert.alert("Clear All Notifications", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearNotifications();
            setShowDropdown(false);
          },
        },
      ]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
      Alert.alert("Error", "Failed to clear notifications");
    }
  }, [clearNotifications]);

  const toggleDropdown = useCallback(
    () => setShowDropdown((prev) => !prev),
    [],
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const totalCount = filter === "all" ? notifications.length : unreadCount;

  const renderNotificationItem = useCallback(
    (notification: any, index: number) => {
      if (!notification?.id) return null;
      const typeInfo = getTypeIcon(notification.type);

      return (
        <TouchableOpacity
          key={`${notification.id}-${index}`}
          className={`py-4 px-5 border-b border-white/5 ${!notification.read ? "bg-green-500/10 border-l-[3px] border-l-blue-500 pl-[17px]" : ""}`}
          onPress={() => markAsRead?.(notification.id)}
          accessibilityLabel={`${notification.title || "Notification"}. ${
            notification.body || ""
          }. ${getFullTimestamp(notification.timestamp || Date.now())}. ${
            notification.read ? "Read" : "Unread"
          }`}
          accessibilityRole="button"
          accessibilityHint={
            notification.read ? "Already read" : "Tap to mark as read"
          }
        >
          <View className="flex-row items-start">
            <View
              className={`w-12 h-12 rounded-full bg-white/10 items-center justify-center mr-3 mt-0.5 ${!notification.read ? "bg-green-500/15 border-2 border-green-500/30" : ""}`}
            >
              <Text className="text-xl">{typeInfo.icon}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-start justify-between mb-1">
                <Text
                  className={`flex-1 text-base font-semibold text-white/90 leading-snug ${!notification.read ? "text-white font-bold" : ""}`}
                  numberOfLines={2}
                >
                  {notification.title || "Untitled Notification"}
                </Text>
                {!notification.read && <View className="w-2 h-2 rounded-full bg-blue-500 ml-2 mt-2" />}
              </View>
              <Text className="text-sm text-white/60 leading-5 mb-2" numberOfLines={3}>
                {notification.body || "No description available"}
              </Text>
              
              {notification.type === "follow_request" && (
                  <View className="flex-row gap-2 mt-1 mb-2">
                     <TouchableOpacity 
                        className="bg-blue-500 px-4 py-1.5 rounded-lg"
                        onPress={() => handleRespond(notification.senderId, true)}
                     >
                       <Text className="text-white font-semibold text-xs">Confirm</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                        className="bg-neutral-800 px-4 py-1.5 rounded-lg border border-neutral-700"
                        onPress={() => handleRespond(notification.senderId, false)}
                     >
                       <Text className="text-white font-semibold text-xs">Delete</Text>
                     </TouchableOpacity>
                  </View>
              )}

              <View className="flex-row items-center justify-between mt-1">
                <Text className="text-xs text-white/40 font-medium">
                  {formatTimestamp(notification.timestamp || Date.now())}
                </Text>
                <Text className="text-[10px] text-white/30 uppercase font-semibold tracking-wider">
                  {notification.type || "system"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [markAsRead],
  );

  return (
    <View className="flex-1 bg-black">
      <ScreenHeader
        title={
          <View className="flex-row items-center gap-3">
            <Text className="text-xl font-bold text-white font-serif italic">Notifications</Text>
            {unreadCount > 0 && (
              <View className="bg-red-500 rounded-xl px-2 py-0.5 min-w-[24px] items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        }
        rightElement={
          <TouchableOpacity
            className="p-2 rounded-full active:bg-white/10"
            onPress={toggleDropdown}
            accessibilityLabel="Notification menu"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={theme.colorWhite}
            />
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View className="flex-row px-5 py-3 gap-3 border-b border-white/5">
        <TouchableOpacity
          className={`px-4 py-2 rounded-xl bg-white/5 ${filter === "all" ? "bg-blue-500" : ""}`}
          onPress={() => setFilter("all")}
        >
          <Text
            className={`text-sm font-semibold ${filter === "all" ? "text-white" : "text-white/60"}`}
          >
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-xl bg-white/5 ${filter === "unread" ? "bg-blue-500" : ""}`}
          onPress={() => setFilter("unread")}
        >
          <Text
            className={`text-sm font-semibold ${filter === "unread" ? "text-white" : "text-white/60"}`}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {showDropdown && (
        <View className="absolute inset-0 z-50 justify-start items-end pt-32 pr-5">
          <TouchableOpacity
            className="absolute inset-0 bg-black/50"
            activeOpacity={1}
            onPress={toggleDropdown}
          />
          <View className="bg-neutral-900 rounded-xl py-2 min-w-[220px] shadow-lg shadow-black border border-white/10">
            <TouchableOpacity
              className={`flex-row items-center px-4 py-3 gap-3 ${unreadCount === 0 ? "opacity-40" : ""}`}
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={
                  unreadCount === 0
                    ? "rgba(255,255,255,0.3)"
                    : theme.color.reactBlue.light
                }
              />
              <Text
                className={`text-[15px] font-medium ${unreadCount === 0 ? "text-white/30" : "text-white"}`}
              >
                Mark All as Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center px-4 py-3 gap-3 ${notifications.length === 0 ? "opacity-40" : ""}`}
              onPress={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Ionicons
                name="trash"
                size={20}
                color={
                  notifications.length === 0
                    ? "rgba(255,255,255,0.3)"
                    : "#ef4444"
                }
              />
              <Text
                className={`text-[15px] font-medium ${notifications.length === 0 ? "text-white/30" : "text-white"}`}
              >
                Clear All
              </Text>
            </TouchableOpacity>

            <View className="h-[1px] bg-white/10 my-2" />
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.color.reactBlue.light}
            colors={[theme.color.reactBlue.light]}
          />
        }
      >
        {totalCount === 0 ? (
          <View className="flex-1 justify-center items-center pt-32 px-10">
            <Ionicons
              name={
                filter === "unread"
                  ? "checkmark-circle-outline"
                  : "notifications-outline"
              }
              size={64}
              color={theme.color.textSecondary.dark}
            />
            <Text className="text-xl font-semibold text-white mt-5 mb-2">
              {filter === "unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </Text>
            <Text className="text-sm text-white/50 text-center leading-5">
              {filter === "unread"
                ? "Check back later for new notifications"
                : "Check back later for new notifications"}
            </Text>
          </View>
        ) : (
          groupedNotifications.map((group, groupIndex) => (
            <View key={`group-${groupIndex}`} className="mt-5">
              <Text className="text-[13px] font-bold text-white/50 uppercase tracking-widest px-5 mb-3">{group.title}</Text>
              {group.notifications.map((notification, i) =>
                renderNotificationItem(notification, i),
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
