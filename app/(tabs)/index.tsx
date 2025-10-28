import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import StoriesSection from "@/components/Stories";
import EmptyState from "@/components/EmptyState";
import { theme } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Alert,
} from "react-native";
import { styles } from "../../styles/feed.styles";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const posts = useQuery(api.posts.getFeedPosts);
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  if (posts === undefined) {
    return (
      <View style={styles.container}>
        <Header onSignOut={handleSignOut} />
        <Loader />
      </View>
    );
  }

  const safePosts = posts?.filter(Boolean) ?? [];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color?.background?.dark || "#000"}
      />

      <Header onSignOut={handleSignOut} />

      {safePosts.length === 0 ? (
        <EmptyState
          icon="camera-outline"
          title="Welcome to Reelix!"
          subtitle="Your feed is empty. Start following people or create your first post to see amazing content here."
          buttonText="Create Your First Post"
          buttonIcon="add-circle"
          onButtonPress={() => {}}
        />
      ) : (
        <FlatList
          data={safePosts}
          renderItem={({ item }) => <Post post={item} />}
          keyExtractor={(item, index) =>
            typeof item._id === "string" ? item._id : String(index)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.feedContainer,
            { paddingBottom: 120 + insets.bottom },
          ]}
          ListHeaderComponent={<StoriesSection />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.color?.reactBlue?.light || "#3b82f6"}
              colors={[theme.color?.reactBlue?.light || "#3b82f6"]}
              progressBackgroundColor={
                theme.color?.backgroundElement?.dark || "#1f2937"
              }
            />
          }
          ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
        />
      )}
    </View>
  );
}

/** 🔹 Reusable Header Component */
const Header = ({ onSignOut }: { onSignOut: () => void }) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>Reelix</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => Alert.alert("Search", "Search is coming soon")}
          accessibilityLabel="Search"
          accessibilityHint="Opens search"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="search-outline"
            size={24}
            color={theme.colorWhite || "#fff"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={onSignOut}
          accessibilityLabel="Sign out"
          accessibilityHint="Signs you out of the app"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={theme.colorWhite || "#fff"}
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);
