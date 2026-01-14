import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
  viewed?: boolean;
  uploading?: boolean;
  onAdd?: () => Promise<void> | void;
};

export default function StoryItem({ story }: { story: Story }) {
  const router = useRouter();
  const markAsViewed = useMutation(api.stories.markStoryAsViewed);
  const spinAnim = new Animated.Value(0);

  if (story.uploading) {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  } else {
    spinAnim.stopAnimation();
  }

  const handlePress = async () => {
    if (!story.hasStory) {
      if (story.onAdd) story.onAdd();
      return;
    }
    try {
      if (story.id && !String(story.id).startsWith("user_")) {
        await markAsViewed({ authorId: story.id as any });
      }
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }

    router.push(`/story/${encodeURIComponent(story.id)}` as any);
  };

  const getRingColor = () => {
    if (!story.hasStory) return "border-transparent";
    if (story.viewed) return "border-neutral-600";
    return "border-pink-500";
  };

  return (
    <TouchableOpacity className="items-center mr-4" onPress={handlePress}>
      <View
        className={`w-16 h-16 rounded-full border-2 p-0.5 justify-center items-center ${getRingColor()}`}
      >
        <Image source={{ uri: story.avatar }} className="w-14 h-14 rounded-full bg-neutral-800" resizeMode="cover" />
        {story.uploading && (
          <Animated.View
            className="absolute left-0 top-0 right-0 bottom-0 rounded-full border-2 border-transparent border-t-white"
            style={{
              transform: [
                {
                  rotate: spinAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          />
        )}
        {story.onAdd && (
          <View className="absolute bottom-0 right-0 bg-white rounded-full w-4 h-4 justify-center items-center border border-black">
            <Text className="text-black text-xs font-bold leading-3">+</Text>
          </View>
        )}
      </View>
      <Text className="text-white text-xs mt-1 text-center truncate w-16" numberOfLines={1}>{story.username}</Text>
    </TouchableOpacity>
  );
}
