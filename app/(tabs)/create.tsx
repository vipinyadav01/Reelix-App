import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  FlatList,
  Image as RNImage,
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import * as FileSystem from "expo-file-system";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  // Steps: 'gallery' | 'caption'
  const [step, setStep] = useState<"gallery" | "caption">("gallery");

  // Gallery State
  const [galleryAssets, setGalleryAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaLibrary.Asset | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);

  // Caption/Upload State
  const [caption, setCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Share");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  // Initial Permission & Fetch
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        fetchAssets();
      }
    })();
  }, []);

  const fetchAssets = async (cursor?: string) => {
    try {
      const { assets, hasNextPage, endCursor } = await MediaLibrary.getAssetsAsync({
        first: 50,
        after: cursor,
        sortBy: [MediaLibrary.SortBy.creationTime],
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
      });
      
      if (!cursor) {
          setGalleryAssets(assets);
          if (assets.length > 0) setSelectedAsset(assets[0]);
      } else {
          setGalleryAssets((prev) => [...prev, ...assets]);
      }
      
      setHasNextPage(hasNextPage);
      setEndCursor(endCursor);
    } catch (e) {
      console.error("Failed to load assets", e);
    }
  };

  const loadMoreAssets = () => {
    if (hasNextPage && endCursor) {
      fetchAssets(endCursor);
    }
  };

  const handleNext = () => {
    if (!selectedAsset) {
      Alert.alert("Error", "Please select an image or video");
      return;
    }
    // Video Duration Check (example 60s)
    if (selectedAsset.mediaType === "video" && selectedAsset.duration > 60) {
      Alert.alert("Video too long", "Please select a video shorter than 60 seconds.");
      return;
    }
    setStep("caption");
  };

  const handleShare = async () => {
    if (!selectedAsset) return;
    try {
      setIsSharing(true);
      setUploadStatus("Uploading...");
      
      Animated.timing(progressAnim, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      const uploadUrl = await generateUploadUrl();
      let storageId: Id<"_storage">;

      const mediaType = selectedAsset.mediaType === "video" ? "video" : "image";
      const mimeType = mediaType === "video" ? "video/mp4" : "image/jpeg";

      if (Platform.OS === "web") {
        const blob = await (await fetch(selectedAsset.uri)).blob();
        const resp = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type || mimeType },
          body: blob,
        });
        if (!resp.ok) throw new Error("Upload Failed");
        const json = await resp.json();
        storageId = json.storageId as Id<"_storage">;
      } else {
        const uploadResult = await FileSystem.uploadAsync(
          uploadUrl,
          selectedAsset.uri,
          {
            httpMethod: "POST",
            fieldName: "file",
            mimeType: mimeType,
          },
        );
        if (uploadResult.status !== 200) throw new Error("Upload Failed");
        storageId = JSON.parse(uploadResult.body).storageId as Id<"_storage">;
      }

      setUploadStatus("Finishing...");
      Animated.timing(progressAnim, {
        toValue: 0.9,
        duration: 500,
        useNativeDriver: false,
      }).start();

      await createPost({ 
          storageId, 
          caption, 
          aspectRatio: selectedAsset.width / selectedAsset.height, 
          format: mediaType 
      });
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();

      Alert.alert("Success", "Your post has been shared!", [
        {
          text: "View in Feed",
          onPress: () => {
             // Reset
             setCaption("");
             setStep("gallery");
             router.push("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      console.error("Error Sharing Post:", error);
      Alert.alert("Error", "Failed to share post. Please try again.");
      progressAnim.setValue(0);
    } finally {
      setIsSharing(false);
      setUploadStatus("Share");
    }
  };

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Permission required to access gallery</Text>
      </View>
    );
  }

  // --- STEP 1: GALLERY PICKER ---
  if (step === "gallery") {
      return (
          <View className="flex-1 bg-black">
              <StatusBar barStyle="light-content" />
              <ScreenHeader 
                  title="New Post"
                  showBackButton={true} // To go back to home if desired? or Close
                  backIconName="close"
                  onBackPress={() => router.back()}
                  rightElement={
                      <TouchableOpacity onPress={handleNext}>
                          <Text className="text-white text-base font-semibold">Next</Text>
                      </TouchableOpacity>
                  }
              />
              
              {/* Preview Area (Top Half) */}
              <View className="w-full h-[375px] bg-neutral-900 border-b border-neutral-800">
                  {selectedAsset && (
                      selectedAsset.mediaType === "video" ? (
                          <Video
                            source={{ uri: selectedAsset.uri }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode={ResizeMode.COVER} // Instagram style crop
                            useNativeControls
                            isLooping
                            shouldPlay={true}
                          />
                      ) : (
                          <Image
                              source={{ uri: selectedAsset.uri }}
                              style={{ width: "100%", height: "100%" }}
                              contentFit="cover" // Instagram crop
                          />
                      )
                  )}
              </View>

              {/* Gallery Grid (Bottom Half) */}
              <View className="flex-1 bg-black">
                  <View className="flex-row justify-between items-center px-4 py-2 border-b border-neutral-800 bg-black">
                       <Text className="text-white font-bold text-base">Recents</Text>
                       <TouchableOpacity className="bg-neutral-800 p-2 rounded-full">
                           <Ionicons name="camera-outline" size={20} color="white" />
                       </TouchableOpacity>
                  </View>
                  <FlatList
                      data={galleryAssets}
                      keyExtractor={(item) => item.id}
                      numColumns={4}
                      onEndReached={loadMoreAssets}
                      onEndReachedThreshold={0.5}
                      renderItem={({ item }) => (
                          <TouchableOpacity
                              onPress={() => setSelectedAsset(item)}
                              className={`flex-1 aspect-square border border-black ${selectedAsset?.id === item.id ? "opacity-60" : "opacity-100"}`}
                              activeOpacity={0.8}
                          >
                              <Image 
                                  source={{ uri: item.uri }}
                                  style={{ width: "100%", height: "100%" }}
                                  contentFit="cover"
                              />
                              {item.mediaType === "video" && (
                                  <View className="absolute right-1 top-1">
                                      <Text className="text-white text-xs font-bold drop-shadow-md">
                                          {Math.floor(item.duration / 60)}:{Math.floor(item.duration % 60).toString().padStart(2, "0")}
                                      </Text>
                                  </View>
                              )}
                          </TouchableOpacity>
                      )}
                  />
              </View>
          </View>
      );
  }

  // --- STEP 2: CAPTION & SHARE ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title="New Post"
        showBackButton={true}
        onBackPress={() => setStep("gallery")}
        rightElement={
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${isSharing ? "opacity-50" : "bg-white"}`}
            disabled={isSharing}
            onPress={handleShare}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
                <Text className="text-black font-bold text-sm">Share</Text>
            )}
          </TouchableOpacity>
        }
      />

        {/* Progress Bar */}
        {isSharing && (
          <View className="w-full h-1 bg-neutral-800">
             <Animated.View
              style={{
                height: "100%",
                backgroundColor: "#FFFFFF",
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        )}

      <ScrollView className="flex-1">
        <View className="flex-row p-4 border-b border-neutral-800">
           {/* Thumbnail */}
           <View className="w-20 h-20 mr-4">
              {selectedAsset && (
                  selectedAsset.mediaType === "video" ? (
                      <Video
                          source={{ uri: selectedAsset.uri }}
                          style={{ width: "100%", height: "100%", borderRadius: 8 }}
                          resizeMode={ResizeMode.COVER}
                      />
                  ) : (
                      <Image
                         source={{ uri: selectedAsset.uri }}
                         style={{ width: "100%", height: "100%", borderRadius: 8 }}
                         contentFit="cover"
                      />
                  )
              )}
           </View>
           
           {/* Caption Input */}
           <View className="flex-1">
               <TextInput
                 className="text-white text-base min-h-[80px]"
                 placeholder="Write a caption..."
                 placeholderTextColor={theme.color?.textSecondary?.dark || "#888"}
                 multiline
                 value={caption}
                 onChangeText={setCaption}
                 editable={!isSharing}
               />
           </View>
        </View>

        <View className="mt-4 border-t border-b border-neutral-800 py-3 px-4 flex-row justify-between items-center">
             <Text className="text-white text-base">Tag People</Text>
             <Ionicons name="chevron-forward" size={20} color="gray" />
        </View>
        <View className="border-b border-neutral-800 py-3 px-4 flex-row justify-between items-center">
             <Text className="text-white text-base">Add Location</Text>
             <Ionicons name="chevron-forward" size={20} color="gray" />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
