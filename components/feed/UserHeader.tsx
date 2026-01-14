import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { COLORS } from "@/constants/theme";

interface UserHeaderProps {
  username: string;
  avatarUrl: string;
  createdAt: string | number | Date;
  onMorePress?: () => void;
  onUserPress?: () => void;
}

export function UserHeader({
  username,
  avatarUrl,
  createdAt,
  onMorePress,
  onUserPress,
}: UserHeaderProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <View className="flex-row items-center justify-between px-3 py-2.5">
      <TouchableOpacity
        className="flex-row items-center"
        onPress={onUserPress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}` }} 
          className="w-8 h-8 rounded-full mr-2.5 bg-neutral-800"
          resizeMode="cover"
        />
        <View className="justify-center">
          <Text className="text-white font-semibold text-sm">{username}</Text>
          <Text className="text-neutral-400 text-xs">{timeAgo}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onMorePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}
