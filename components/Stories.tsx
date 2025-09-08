import { STORIES } from "@/constants/mock-data";
import { styles } from "@/styles/feed.styles";
import { ScrollView } from "react-native";
import Story from "./Story";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const StoriesSection = () => {
  const liveStories = useQuery(api.stories.getStories);
  const data = liveStories && liveStories.length > 0 ? liveStories : STORIES;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
      {data.map((story) => (
        <Story key={story.id} story={story} />
      ))}
    </ScrollView>
  );
};

export default StoriesSection;