import { Loader } from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* ENHANCED HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.headerRight}>
          <Ionicons name="bookmark" size={24} color={COLORS.white} />
        </View>
      </View>

      {/* ENHANCED POSTS GRID */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 8,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          showsVerticalScrollIndicator={false}
        >
          {bookmarkedPosts.map((post) => {
            if (!post) return null;
            return (
              <View 
                key={post._id} 
                style={{ 
                  width: "33.33%", 
                  padding: 2,
                }}
              >
                <View style={styles.bookmarkImageContainer}>
                  <Image
                    source={post.imageUrl}
                    style={styles.bookmarkImage}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.bookmarkOverlay}>
                    <Ionicons name="bookmark" size={16} color={COLORS.white} />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

function NoBookmarksFound() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.headerRight}>
          <Ionicons name="bookmark" size={24} color={COLORS.white} />
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