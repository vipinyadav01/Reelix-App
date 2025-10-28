import { Loader } from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { theme } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Bookmarks() {
  const insets = useSafeAreaInsets();
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  // ✅ Properly handle undefined and empty cases
  if (bookmarkedPosts === undefined) return <Loader />;
  const safeBookmarks = bookmarkedPosts.filter((p) => p != null);
  if (safeBookmarks.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color.background.dark}
      />

      {/* ENHANCED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.headerRight}>
          <Ionicons name="bookmark" size={24} color={theme.colorWhite} />
        </View>
      </View>

      {/* ENHANCED POSTS GRID */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 8,
            paddingBottom: 120 + insets.bottom,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          showsVerticalScrollIndicator={false}
        >
          {safeBookmarks.map((post) => (
            <View
              key={post._id}
              style={{
                width: "33.33%",
                padding: 2,
              }}
            >
              <View style={styles.bookmarkImageContainer}>
                <Image
                  source={{ uri: post.imageUrl }}
                  style={styles.bookmarkImage}
                  contentFit="cover"
                  transition={300}
                  cachePolicy="memory-disk"
                />
                <View style={styles.bookmarkOverlay}>
                  <Ionicons
                    name="bookmark"
                    size={16}
                    color={theme.colorWhite}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function NoBookmarksFound() {
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color.background.dark}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.headerRight}>
          <Ionicons name="bookmark" size={24} color={theme.colorWhite} />
        </View>
      </View>

      <EmptyState
        icon="bookmark-outline"
        title="No Bookmarks Yet"
        subtitle="Save posts you love by tapping the bookmark icon. They'll appear here for easy access later."
      />
    </View>
  );
}
