import { styles } from "@/styles/feed.styles";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
  onAdd?: () => Promise<void> | void;
};

export default function Story({ story }: { story: Story }) {
  const router = useRouter();
  const handlePress = () => {
    if (!story.hasStory) {
      if (story.onAdd) story.onAdd();
      return;
    }
    router.push(`/story/${encodeURIComponent(story.id)}` as any);
  };
  return (
    <TouchableOpacity style={styles.storyWrapper} onPress={handlePress}>
      <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
        <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
        {!story.hasStory && story.onAdd && (
          <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 0 }}>
            <Text style={{ color: '#000', fontSize: 12 }}>+</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
}