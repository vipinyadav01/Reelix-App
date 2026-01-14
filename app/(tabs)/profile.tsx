import { Loader } from "@/components/Loader";
import { ScreenHeader } from "@/components/ScreenHeader";
import { theme } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";

import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function Profile() {
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const currentUser = useQuery(
    api.user.getUserByClerkId,
    userId ? { clerkId: userId } : "skip",
  );

  const [editedProfile, setEditedProfile] = useState({
    fullname: currentUser?.fullname || "",
    bio: currentUser?.bio || "",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const posts = useQuery(api.posts.getPostsByUser, {});

  const updateProfile = useMutation(api.user.updateProfile);

  const handleSaveProfile = async () => {
    await updateProfile(editedProfile);
    setIsEditModalVisible(false);
  };

  if (!currentUser || posts === undefined) return <Loader />;

  return (
    <View className="flex-1 bg-black">
      <ScreenHeader
        title={currentUser.username}
        showBackButton={false}
        rightElement={
          <TouchableOpacity className="p-2" onPress={() => signOut()}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.colorWhite}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <View className="px-4 pt-4 pb-2">
          {/* TOP ROW: AVATAR & STATS */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="mr-4">
              <Image
                source={{ 
                  uri: user?.imageUrl 
                    ? user.imageUrl 
                    : (currentUser.image && currentUser.image.trim() !== "" 
                      ? currentUser.image 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || "User")}&background=random`)
                }}
                className="w-[86px] h-[86px] rounded-full border border-neutral-800 bg-neutral-900"
                resizeMode="cover"
              />
            </View>

            <View className="flex-1 flex-row justify-around items-center ml-2">
              <View className="items-center">
                <Text className="text-white text-[17px] font-bold leading-5">{posts.length}</Text>
                <Text className="text-white text-[13px] leading-5">posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-[17px] font-bold leading-5">
                  {currentUser.followers || 0}
                </Text>
                <Text className="text-white text-[13px] leading-5">followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-[17px] font-bold leading-5">
                  {currentUser.following || 0}
                </Text>
                <Text className="text-white text-[13px] leading-5">following</Text>
              </View>
            </View>
          </View>

          {/* BIO SECTION */}
          <View className="mb-4">
            <Text className="text-white font-bold text-[13px] mb-0.5 pointer-events-none">
              {currentUser.fullname || currentUser.username}
            </Text>
            {currentUser.bio && (
              <Text className="text-white text-[13px] leading-[18px]">
                {currentUser.bio}
              </Text>
            )}
          </View>

          {/* ACTION BUTTONS */}
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              className="flex-1 bg-[#363636] h-[32px] rounded-lg items-center justify-center active:opacity-70"
              onPress={() => setIsEditModalVisible(true)}
            >
              <Text className="text-white text-[13px] font-semibold">Edit profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-[#363636] h-[32px] rounded-lg items-center justify-center active:opacity-70"
            >
              <Text className="text-white text-[13px] font-semibold">Share profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TABS (Grid / Reels / Tags) */}
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
          {posts.length === 0 ? (
             <View className="w-full pt-12">
               <NoPostsFound />
             </View>
          ) : (
            posts.map((post) => (
              <TouchableOpacity
                key={post._id}
                style={{
                  width: (width - 2) / 3, // (Screen - 2 gaps) / 3 columns
                  height: (width - 2) / 3,
                }}
                activeOpacity={0.8}
                onPress={() => setSelectedPost(post)}
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

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-black/50 justify-end"
          >
            <View className="bg-neutral-900 rounded-t-3xl p-5 pb-10">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-white text-xl font-semibold">Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color={theme.colorWhite} />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-white text-base mb-2">Name</Text>
                <TextInput
                  className="bg-black rounded-lg p-3 text-white text-base border border-neutral-700"
                  value={editedProfile.fullname}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, fullname: text }))
                  }
                  placeholderTextColor={theme.color.textSecondary.dark}
                />
              </View>

              <View className="mb-4">
                <Text className="text-white text-base mb-2">Bio</Text>
                <TextInput
                  className="bg-black rounded-lg p-3 text-white text-base border border-neutral-700 h-20"
                  value={editedProfile.bio}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={theme.color.textSecondary.dark}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                className="bg-blue-500 py-4 rounded-lg items-center mt-5"
                onPress={handleSaveProfile}
              >
                <Text className="text-white text-base font-semibold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* SELECTED IMAGE MODAL */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          {selectedPost && (
            <View className="w-[90%] h-[80%]">
              <View className="flex-row justify-end mb-5">
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={theme.colorWhite} />
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: selectedPost.imageUrl }}
                className="w-full h-full rounded-lg"
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View className="items-center py-12 px-8">
      <Ionicons
        name="images-outline"
        size={48}
        color={theme.color.textSecondary.dark}
      />
      <Text className="text-white text-lg font-semibold mt-4 text-center">No posts yet</Text>
      <Text className="text-neutral-400 text-sm mt-2 text-center">
        Share your first moment with the world!
      </Text>
    </View>
  );
}
