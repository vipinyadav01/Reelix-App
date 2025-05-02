import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "../../styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { STORIES } from "@/constants/mock-data";
import Story from "@/components/Story";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "@/components/Loader";
import Post from "@/components/Post";

export default function Index() {
  const { signOut } = useAuth();
  const posts = useQuery(api.posts.getFeedPosts)

  if (posts === undefined) return <Loader/>;
  if (posts.length === 0) return <Text style={{ color: COLORS.gray }}>No posts found</Text>;
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reelix</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
       contentContainerStyle={{ paddingBottom: 60 }}
       >
       
        {/* STORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {STORIES.map((story)=>(
            <Story key={story.id} story={story} />
          ))}
        </ScrollView>
        {/* POSTS */}
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </ScrollView>
    </View>
  );
}
