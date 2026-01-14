import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useProfileIntegration } from "@/hooks/useProfileIntegration";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileSkeleton } from "@/components/SkeletonLoaders";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useUser();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const {
    profileData,
    isLoading,
    error,
    isOwnProfile,
    handleFollowToggle,
    handleRefresh,
    handleEditProfile,
    handleMessage,
    handleRespondToRequest,
  } = useProfileIntegration({
    targetUserId: userId,
    currentUserId: currentUser?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await handleRefresh();
    setRefreshing(false);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profileData) {
    return (
      <View className="flex-1 justify-center items-center bg-black px-8">
        <ScreenHeader title="Profile" showBackButton />
        <View className="flex-1 justify-center items-center">
             <Ionicons name="alert-circle" size={64} color={COLORS.gray} />
             <Text className="text-white text-2xl font-bold mt-4 text-center">User Not Found</Text>
             <TouchableOpacity
               className="bg-white px-6 py-3 rounded-lg mt-6"
               onPress={() => router.back()}
             >
               <Text className="text-black text-base font-semibold">Go Back</Text>
             </TouchableOpacity>
        </View>
      </View>
    );
  }

  const {
    user,
    posts,
    stories,
    followStatus: relationshipStatus,
  } = profileData;

  const username = user?.username || "User";
  const avatarUrl = user?.imageUrl || user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title={username}
        showBackButton={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.white}
          />
        }
      >
        <View className="px-4 pt-4 pb-2">
          {/* TOP ROW: AVATAR & STATS */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="mr-4">
              <Image
                source={{ uri: avatarUrl }}
                className="w-[86px] h-[86px] rounded-full border border-neutral-800 bg-neutral-900"
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 flex-row justify-around items-center ml-2">
              <View className="items-center">
                <Text className="text-white text-[17px] font-bold leading-5">{posts?.length || 0}</Text>
                <Text className="text-white text-[13px] leading-5">posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-[17px] font-bold leading-5">
                  {user?.followersCount || 0}
                </Text>
                <Text className="text-white text[13px] leading-5">followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-[17px] font-bold leading-5">
                  {user?.followingCount || 0}
                </Text>
                <Text className="text-white text-[13px] leading-5">following</Text>
              </View>
            </View>
          </View>

          {/* BIO SECTION */}
          <View className="mb-4">
             <Text className="text-white font-bold text-[13px] mb-0.5 pointer-events-none">
               {user?.firstName} {user?.lastName}
             </Text>
             {user?.bio && (
               <Text className="text-white text-[13px] leading-[18px]">
                 {user.bio}
               </Text>
             )}
          </View>

          {/* ACTION BUTTONS */}
          {isOwnProfile ? (
             <View className="flex-row gap-2 mb-2">
               <TouchableOpacity
                 className="flex-1 bg-[#363636] h-[32px] rounded-lg items-center justify-center active:opacity-70"
                 onPress={handleEditProfile}
               >
                 <Text className="text-white text-[13px] font-semibold">Edit profile</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 className="flex-1 bg-[#363636] h-[32px] rounded-lg items-center justify-center active:opacity-70"
               >
                 <Text className="text-white text-[13px] font-semibold">Share profile</Text>
               </TouchableOpacity>
             </View>
          ) : (relationshipStatus as any)?.hasIncomingRequest ? (
              <View className="flex-row gap-2 mb-2">
                 <TouchableOpacity
                   className="flex-1 bg-blue-500 h-[32px] rounded-lg items-center justify-center"
                   onPress={() => handleRespondToRequest(true)}
                 >
                   <Text className="text-white text-[13px] font-semibold">Confirm</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                   className="flex-1 bg-[#363636] h-[32px] rounded-lg items-center justify-center"
                   onPress={() => handleRespondToRequest(false)}
                 >
                   <Text className="text-white text-[13px] font-semibold">Delete</Text>
                 </TouchableOpacity>
              </View>
          ) : (
             <View className="flex-row gap-2 mb-2">
                <TouchableOpacity
                  className={`flex-1 h-[32px] rounded-lg items-center justify-center active:opacity-70 ${
                    relationshipStatus?.followStatus === "following" || (relationshipStatus as any)?.hasPendingRequest
                      ? "bg-[#363636]"
                      : "bg-blue-500"
                  }`}
                  onPress={handleFollowToggle}
                  disabled={isLoading || (relationshipStatus as any)?.hasPendingRequest}
                >
                  <Text className="text-white text-[13px] font-semibold">
                    {relationshipStatus?.followStatus === "following" ? "Following" : 
                     (relationshipStatus as any)?.hasPendingRequest ? "Requested" : 
                     (relationshipStatus as any)?.isFollowingMe ? "Follow Back" : 
                     "Follow"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-[#363636] h-[32px] rounded-lg items-center justify-center active:opacity-70"
                  onPress={handleMessage}
                >
                  <Text className="text-white text-[13px] font-semibold">Message</Text>
                </TouchableOpacity>
             </View>
          )}
        </View>

        {/* Stories Section (Horizontal Scroll if exists) */}
        {stories && stories.length > 0 && (
          <View className="mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {stories.map((story) => (
                <TouchableOpacity
                  key={story._id}
                  className="mr-3"
                  onPress={() => router.push(`/story/${story._id}` as any)}
                >
                  <View className="p-[2px] rounded-full border border-neutral-700">
                    <Image
                        source={{ uri: story.imageUrl }}
                        className="w-[60px] h-[60px] rounded-full"
                        resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* TABS */}
        <View className="flex-row border-t border-neutral-800 mt-2">
          <TouchableOpacity className="flex-1 items-center justify-center h-[44px] border-b border-white">
            <Ionicons name="grid" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center h-[44px]">
            <Ionicons name="videocam-outline" size={26} color="#737373" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center justify-center h-[44px]">
            <Ionicons name="person-outline" size={24} color="#737373" />
          </TouchableOpacity>
        </View>

        {/* POSTS GRID */}
        <View className="flex-row flex-wrap" style={{ gap: 1 }}>
          {!posts || posts.length === 0 ? (
             <View className="w-full pt-12 items-center">
                <Ionicons name="images-outline" size={48} color={COLORS.gray} />
                <Text className="text-neutral-400 mt-4 text-base">No posts yet</Text>
             </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post._id}
                style={{
                  width: (width - 2) / 3,
                  height: (width - 2) / 3,
                }}
                activeOpacity={0.8}
                onPress={() => router.push(`/post/${post._id}` as any)}
              >
                <Image
                  source={{ uri: post.imageUrl }}
                  className="w-full h-full bg-neutral-900"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}
