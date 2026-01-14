import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface LikeCommentBarProps {
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

export function LikeCommentBar({
  likesCount,
  commentsCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
}: LikeCommentBarProps) {
  // Local state for immediate feedback (can be controlled by parent too)
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  return (
    <View className="flex-row justify-between items-center px-3 py-2.5">
      <View className="flex-row items-center">
        <View className="mr-0">
            <TouchableOpacity onPress={handleLike} className="mr-4">
            <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={26}
                color={liked ? COLORS.colorRed : COLORS.text}
            />
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onComment} className="mr-4">
          <Ionicons name="chatbubble-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} className="mr-4">
          <Ionicons name="paper-plane-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSave}>
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={24}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  );
}
