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
} from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useState, useRef, useEffect } from "react";
import { styles } from "@/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import * as FileSystem from "expo-file-system";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Share");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera roll access is required to pick media.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow videos
        allowsEditing: true,
        quality: 0.8,
        // Removed fixed aspect ratio to allow users to choose their own crop
        // or keep original aspect ratio if the OS picker supports it
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        
        if (asset.type === 'video') {
           if (asset.duration && asset.duration > 15000) { // 15 seconds
             Alert.alert("Video too long", "Please select a video shorter than 15 seconds.");
             return;
           }
           setMediaType("video");
        } else {
           setMediaType("image");
        }

        setSelectedImage(asset.uri);
        setAspectRatio(asset.width / asset.height);
        
        // Reset scale for nice animation
        scaleAnim.setValue(0.8);
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    } catch (_err) {
      Alert.alert("Error", "Unable to open picker.");
    }
  };

  const handleShare = async () => {
    if (!selectedImage) return;
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

      if (Platform.OS === "web") {
        const blob = await (await fetch(selectedImage)).blob();
        const resp = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type || (mediaType === 'video' ? "video/mp4" : "image/jpeg") },
          body: blob,
        });
        if (!resp.ok) throw new Error("Upload Failed");
        const json = await resp.json();
        storageId = json.storageId as Id<"_storage">;
      } else {
        const uploadResult = await FileSystem.uploadAsync(
          uploadUrl,
          selectedImage,
          {
            httpMethod: "POST",
            fieldName: "file",
            mimeType: mediaType === 'video' ? "video/mp4" : "image/jpeg",
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

      await createPost({ storageId, caption, aspectRatio, format: mediaType });
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();

      Alert.alert("Success", "Your post has been shared!", [
        {
          text: "View in Feed",
          onPress: () => {
            setSelectedImage(null);
            setCaption("");
            router.push("/(tabs)");
          },
        },
        {
          text: "Create Another",
          onPress: () => {
            setSelectedImage(null);
            setCaption("");
            scaleAnim.setValue(0.8);
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
            }).start();
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

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.color?.background?.dark || "#000"}
        />

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colorWhite || "#fff"}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Empty State */}
        <Animated.View
          style={[
            styles.emptyStateContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.emptyImageContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="camera"
                size={64}
                color={theme.colorWhite || "#fff"}
              />
            </View>
            <Text style={styles.emptyTitle}>Share Your Moment</Text>
            <Text style={styles.emptySubtitle}>
              Select a photo to get started
            </Text>
            <TouchableOpacity
              style={styles.selectImageButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <View style={styles.selectImageGradient}>
                <Ionicons
                  name="image"
                  size={20}
                  color={theme.colorBlack || "#000"}
                />
                <Text style={styles.selectImageText}>Choose Photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      // Add a small offset if needed, or adjust based on header height
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0} 
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.color?.background?.dark || "#000"}
      />

      <View style={styles.contentContainer}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Discard Post?", "Discard this post?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Discard",
                  style: "destructive",
                  onPress: () => {
                    setSelectedImage(null);
                    setCaption("");
                  },
                },
              ])
            }
            disabled={isSharing}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={28}
              color={
                isSharing
                  ? theme.color?.textSecondary?.dark || "#888"
                  : theme.colorWhite || "#fff"
              }
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Post</Text>

          <TouchableOpacity
            style={[
              styles.shareButton,
              isSharing && styles.shareButtonDisabled,
            ]}
            disabled={isSharing || !selectedImage}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            {isSharing ? (
              <ActivityIndicator
                size="small"
                color={theme.colorWhite || "#fff"}
              />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Bar */}
        {isSharing && (
          <View style={{ width: "100%", height: 3, backgroundColor: "rgba(255,255,255,0.1)" }}>
             <Animated.View
              style={{
                height: "100%",
                backgroundColor: theme.primary || "#E1306C",
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        )}

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} // Add padding for keyboard
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Image Preview - Dynamic Aspect Ratio */}
            <View style={{ padding: 16 }}>
              <Animated.View
                style={[
                  styles.imageContainer,
                  { 
                    transform: [{ scale: scaleAnim }],
                    aspectRatio: aspectRatio,
                    // Use a max height but ensure the view doesn't get cut off weirdly
                    // We let the container height be driven by aspect ratio up to a limit
                    maxHeight: SCREEN_WIDTH * 1.5,
                    width: '100%',
                    alignSelf: 'center',
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: '#1a1a1a', // placeholder background
                  },
                ]}
              >
                {mediaType === 'video' ? (
                  <Video
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    isLooping
                    shouldPlay
                  />
                ) : (
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain" 
                    transition={300}
                  />
                )}
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={pickImage}
                    disabled={isSharing}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="camera"
                      size={18}
                      color={theme.colorWhite || "#fff"}
                    />
                    <Text style={styles.changeImageText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>

            {/* Caption Input */}
            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <View style={styles.userInfo}>
                  <Image
                    source={{ uri: user?.imageUrl }}
                    style={styles.userAvatar}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.username}>
                      {user?.username || user?.firstName}
                    </Text>
                    <Text style={styles.userHandle}>
                      @{user?.username || "user"}
                    </Text>
                    {isSharing && (
                      <Text style={{ fontSize: 12, color: theme.primary || "#E1306C", marginTop: 2 }}>
                        {uploadStatus}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Write a caption..."
                    placeholderTextColor={
                      theme.color?.textSecondary?.dark || "#888"
                    }
                    multiline
                    numberOfLines={4} // Give it some initial height
                    value={caption}
                    onChangeText={setCaption}
                    editable={!isSharing}
                    maxLength={2200}
                    scrollEnabled={true} // Explicitly enable scrolling in TextInput
                  />
                  <Text style={styles.characterCount}>
                    {caption.length}/2200
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
