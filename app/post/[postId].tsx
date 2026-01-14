import { View, ScrollView, Text, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Post from "@/components/Post";
import { Loader } from "@/components/Loader";
import { ScreenHeader } from "@/components/ScreenHeader";
import { theme } from "@/constants/theme";

export default function PostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();

  const post = useQuery(api.posts.getPostById, {
    postId: postId as Id<"posts">,
  });

  if (post === undefined) {
    return <Loader />;
  }

  if (post === null) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ScreenHeader title="Post" showBackButton />
        <Text className="text-white text-lg font-semibold mt-10">Post not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Post"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Post post={post} />
      </ScrollView>
    </View>
  );
}
