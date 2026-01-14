import React from "react";
import { View, Text } from "react-native";
import { UserHeader } from "./UserHeader";
import { MediaCarousel, MediaItem } from "./MediaCarousel";
import { LikeCommentBar } from "./LikeCommentBar";

export interface Post {
  id: string;
  user: {
    username: string;
    avatarUrl: string;
  };
  createdAt: string | number | Date;
  media: MediaItem[];
  likesCount: number;
  commentsCount: number;
  caption: string;
  isLiked: boolean;
  isSaved: boolean;
  recentComments?: {
      _id: string;
      content: string;
      user: {
          username: string;
          fullname: string;
      };
  }[];
}

interface FeedCardProps {
  post: Post;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onSavePress?: () => void;
  onUserPress?: () => void;
}

export function FeedCard({ post, onLikePress, onCommentPress, onSharePress, onSavePress, onUserPress }: FeedCardProps) {
  return (
    <View className="mb-5 border-b border-neutral-800 pb-2.5">
      <UserHeader
        username={post.user.username}
        avatarUrl={post.user.avatarUrl}
        createdAt={post.createdAt}
        onUserPress={onUserPress}
      />
      
      <MediaCarousel media={post.media} />
      
      <LikeCommentBar
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        isLiked={post.isLiked}
        isSaved={post.isSaved}
        onLike={onLikePress}
        onComment={onCommentPress}
        onShare={onSharePress}
        onSave={onSavePress}
      />

      <View className="px-3 pb-2.5">
        <Text className="text-white font-semibold text-sm mb-1.5">{post.likesCount.toLocaleString()} likes</Text>
        
        <View className="mb-1">
          <Text className="text-white text-sm leading-5" numberOfLines={2}>
            <Text className="font-bold">{post.user.username}</Text>
            {"  "}
            {post.caption}
          </Text>
        </View>

        {post.commentsCount > 0 && (
          <Text className="text-neutral-400 text-sm mt-1 mb-1" onPress={onCommentPress}>
            View all {post.commentsCount} comments
          </Text>
        )}

        {/* Recent Comments */}
        {post.recentComments && post.recentComments.map((comment) => (
            <View key={comment._id} className="flex-row mt-1">
                <Text className="text-white text-sm leading-5" numberOfLines={1}>
                    <Text className="font-bold">{comment.user.username}</Text>
                    {"  "}
                    {comment.content}
                </Text>
            </View>
        ))}
      </View>
    </View>
  );
}
