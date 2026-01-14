import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CommentsModal from "./CommentsModal";
import { useUser } from "@clerk/clerk-expo";
import { FeedCard } from "@/components/feed/FeedCard";

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    aspectRatio?: number;
    format?: string;
    author: {
      _id: string;
      username: string;
      image: string;
      clerkId: string;
    };
    recentComments?: {
      _id: string;
      content: string;
      user: {
        fullname: string;
        username: string;
      };
    }[];
  };
};

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const currentUser = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newIsBookmarked);
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
      setShowMenu(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    alert("Feature coming soon");
  };

  const handleUserImageClick = () => {
    router.push(`/u/${post.author.clerkId}` as any);
  };

  // Map the Convex post data to our FeedCard structure
  const feedPost = {
    id: post._id,
    user: {
      username: post.author.username,
      avatarUrl: post.author.image,
    },
    createdAt: post._creationTime,
    media: [
      {
        id: "1",
        type: (post.format === "video" ? "video" : "image") as "image" | "video",
        url: post.imageUrl,
      },
    ],
    likesCount: post.likes,
    commentsCount: post.comments,
    caption: post.caption || "",
    isLiked: isLiked,
    isSaved: isBookmarked,
    recentComments: post.recentComments || [],
  };

  return (
    <View>
      <FeedCard
        post={feedPost}
        onLikePress={handleLike}
        onCommentPress={() => setShowComments(true)}
        onSharePress={() => {}} // Placeholder
        onSavePress={handleBookmark}
        onUserPress={handleUserImageClick}
      />

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
      {showMenu && (
             <View className="absolute top-12 right-2.5 bg-neutral-900 rounded-lg border border-white/10 py-1.5 min-w-[140px] z-50">
               {post.author._id === currentUser?._id && (
                 <TouchableOpacity
                   onPress={handleEdit}
                   className="flex-row items-center px-3 py-2"
                 >
                   <MaterialCommunityIcons
                     name="pencil-outline"
                     size={18}
                     color={COLORS.white}
                   />
                   <Text className="text-white ml-2">
                     Edit
                   </Text>
                 </TouchableOpacity>
               )}
               {post.author._id === currentUser?._id && (
                 <TouchableOpacity
                   onPress={handleDelete}
                   className="flex-row items-center px-3 py-2"
                 >
                   <MaterialCommunityIcons
                     name="trash-can-outline"
                     size={18}
                     color={COLORS.primary}
                   />
                   <Text className="text-primary ml-2 text-pink-500">
                     Delete
                   </Text>
                 </TouchableOpacity>
               )}
             </View>
           )}
    </View>
  );
}
