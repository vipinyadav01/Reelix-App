import { STORIES } from "@/constants/mock-data";
import { styles } from "@/styles/feed.styles";
import { ScrollView } from "react-native";
import Story from "./Story";
import { useAddStory } from "@/hooks/useAddStory";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const StoriesSection = () => {
  const { user } = useUser();
  const addStory = useAddStory();
  const liveStories = useQuery(api.stories.getStoriesFeed);
  const meConvex = useQuery(api.user.getUserByClerkId, user?.id ? { clerkId: user.id } : 'skip');
  let data = liveStories && liveStories.length > 0 ? liveStories : STORIES;
  if (user) {
    const meId = (meConvex?._id as any) ? String(meConvex?._id as any) : null;
    const existingMe = meId ? (liveStories || []).find((s: any) => String(s.id) === meId) : null;
    const me = {
      id: meId ?? `user_${user.id}`,
      username: user.username || user.firstName || 'You',
      avatar: user.imageUrl || '',
      hasStory: existingMe ? existingMe.hasStory : false,
      onAdd: addStory,
    } as any;
    data = [
      me,
      ...data.filter((s: any) => String(s.id) !== (meId ?? `user_${user.id}`) && s.username !== me.username),
    ];
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
      {data.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

export default StoriesSection;