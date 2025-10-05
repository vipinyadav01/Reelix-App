import { styles } from "@/styles/feed.styles";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
  viewed?: boolean;
  onAdd?: () => Promise<void> | void;
};

export default function StoryItem({ story }: { story: Story }) {
  const router = useRouter();
  const markAsViewed = useMutation(api.stories.markStoryAsViewed);
  
  const handlePress = async () => {
    if (!story.hasStory) {
      if (story.onAdd) story.onAdd();
      return;
    }
    try {
      if (story.id && !String(story.id).startsWith('user_')) {
        await markAsViewed({ authorId: story.id as any });
      }
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
    
    router.push(`/story/${encodeURIComponent(story.id)}` as any);
  };
  return (
    <TouchableOpacity style={styles.storyWrapper} onPress={handlePress}>
      <View style={[
        styles.storyRing, 
        !story.hasStory && styles.noStory,
        story.viewed && styles.viewedStory
      ]}>
        <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
        {story.onAdd && (
          <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 0 }}>
            <Text style={{ color: '#000', fontSize: 12 }}>+</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
}