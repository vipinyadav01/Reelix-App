import { useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FeedSkeleton } from "@/components/SkeletonLoaders";
import Post from "@/components/Post";
import StoriesSection from "@/components/Stories";
import EmptyState from "@/components/EmptyState";
import { theme } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlashList } from "@shopify/flash-list";
import {
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
} from "react-native";

import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 85;

export default function Index() {
  const { signOut } = useAuth();
  const router = useRouter();
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

  const navigateToNotifications = () => {
    router.push("/(tabs)/notification");
  };

  if (posts === undefined) {
    return <FeedSkeleton />;
  }

  const safePosts = (posts ?? []).filter((p): p is NonNullable<typeof p> => p !== null);

  return (
    <View className="flex-1 bg-black">
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color?.background?.dark || "#000"}
      />

      <Header onNotification={navigateToNotifications} />

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
        <FlashList<any>
          data={safePosts}
          renderItem={({ item }) => <Post post={item} />}
          keyExtractor={(item, index) =>
            item?._id ? item._id : String(index)
          }
          estimatedItemSize={600}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
             paddingBottom: insets.bottom + 80,
          }}
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
          ItemSeparatorComponent={() => <View className="h-4" />}
        />
      )}
    </View>
  );
}
const Header = ({ onNotification }: { onNotification: () => void }) => (
  <ScreenHeader
    title={<Text className="text-3xl font-bold font-serif italic text-white text-shadow">Reelix</Text>}
    rightElement={
      <View className="flex-row gap-4">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => Alert.alert("Search", "Search is coming soon")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotification}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    }
  />
);
