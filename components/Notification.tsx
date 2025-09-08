import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/notifications.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface NotificationProps {
  notification: {
    _id: string;
    _creationTime: number;
    type: "like" | "follow" | "comment";
    sender: {
      _id: string;
      username: string;
      image: string;
    };
    post?: {
      _id: string;
      imageUrl: string;
      _creationTime?: number;
      caption?: string;
      userId?: string;
      storageId?: string;
      likes?: number;
      comments?: number;
    } | null;
    comment?: string;
  };
}

export default function Notification({ notification }: NotificationProps) {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => router.push(`/user/${notification.sender._id}` as any)}
        >
            <Image
              source={{ uri: notification.sender.image }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.iconBadge}>
              {notification.type === "like" ? (
                <Ionicons name="heart" size={14} color={COLORS.white} />
              ) : notification.type === "follow" ? (
                <Ionicons name="person-add" size={14} color={COLORS.white} />
              ) : (
                <Ionicons name="chatbubble" size={14} color={COLORS.white} />
              )}
            </View>
          </TouchableOpacity>

        <View style={styles.notificationInfo}>
          <TouchableOpacity onPress={() => router.push(`/user/${notification.sender._id}` as any)}>
            <Text style={styles.username}>{notification.sender.username}</Text>
          </TouchableOpacity>

          <Text style={styles.action}>
            {notification.type === "follow"
              ? "started following you"
              : notification.type === "like"
              ? "liked your post"
              : `commented: "${notification.comment || ""}"`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Image
          source={{ uri: notification.post.imageUrl }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}
    </View>
  );
}