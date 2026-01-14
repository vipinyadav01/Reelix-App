import EmptyState from "@/components/EmptyState";
import { theme } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { View, ScrollView, StatusBar, Image, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ScreenHeader } from "@/components/ScreenHeader";
import { BookmarksSkeleton } from "@/components/SkeletonLoaders";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 3;

export default function Bookmarks() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <BookmarksSkeleton />;
  
  const safeBookmarks = bookmarkedPosts.filter((p): p is NonNullable<typeof bookmarkedPosts[number]> => p !== null && !!p.imageUrl);

  if (safeBookmarks.length === 0) return <NoBookmarksFound />;

  return (
    <View className="flex-1 bg-black">
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color?.background?.dark || "#000"}
      />

      <ScreenHeader
        title="Bookmarks"
        rightElement={
          <View className="flex-row items-center">
            <Ionicons name="bookmark" size={24} color={theme.colorWhite || "#fff"} />
          </View>
        }
      />

      {/* ENHANCED POSTS GRID */}
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 120 + insets.bottom,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          showsVerticalScrollIndicator={false}
        >
          {safeBookmarks.map((post) => (
            <TouchableOpacity
              key={post._id}
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                padding: 1, // 1px gap
              }}
              activeOpacity={0.8}
              onPress={() => router.push(`/post/${post._id}` as any)}
            >
              <View className="w-full h-full bg-neutral-900 overflow-hidden">
                <Image
                  source={{ uri: post.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function NoBookmarksFound() {
  return (
    <View className="flex-1 bg-black">
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color?.background?.dark || "#000"}
      />

      <ScreenHeader
        title="Bookmarks"
        rightElement={
          <View className="flex-row items-center">
            <Ionicons name="bookmark" size={24} color={theme.colorWhite || "#fff"} />
          </View>
        }
      />

      <EmptyState
        icon="bookmark-outline"
        title="No Bookmarks Yet"
        subtitle="Save posts you love by tapping the bookmark icon. They'll appear here for easy access later."
      />
    </View>
  );
}
