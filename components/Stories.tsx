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
  let data = liveStories && liveStories.length > 0 ? liveStories : STORIES;
  if (user) {
    const existingMe = liveStories?.find((s: any) => String(s.id) === String(user.id));
    const me = {
      id: user.id,
      username: user.username || user.firstName || 'You',
      avatar: user.imageUrl || '',
      hasStory: existingMe ? existingMe.hasStory : false,
      onAdd: addStory,
    } as any;
    data = [me, ...data.filter((s: any) => String(s.id) !== String(me.id))];
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