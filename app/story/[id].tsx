import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Image } from "expo-image";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // -- IDs Logic --
  const isStringId = typeof id === "string";
  const isLikelyConvexId =
    isStringId &&
    (id as string).length > 10 &&
    !(id as string).startsWith("user_");
  const isLikelyClerkId = isStringId && (id as string).startsWith("user_");

  // -- Convex Data --
  const clerkUser = useQuery(
    api.user.getUserByClerkId,
    isLikelyClerkId ? { clerkId: id as string } : "skip",
  );
  const resolvedConvexUserId = isLikelyConvexId
    ? (id as any)
    : (clerkUser?._id as any | undefined);
  const stories = useQuery(
    api.stories.getUserStories,
    resolvedConvexUserId ? { userId: resolvedConvexUserId } : "skip",
  );
  const { userId: clerkUserId } = useAuth();
  const me = useQuery(
    api.user.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip",
  );
  
  // -- Mutations --
  const recordImpression = useMutation(api.stories.recordImpression);
  const recordTap = useMutation(api.stories.recordTap);
  
  // -- Viewers Data --
  const isMyStory = me && resolvedConvexUserId && String(me._id) === String(resolvedConvexUserId);
  const viewersData = useQuery(
    api.stories.getStoryViewers,
    isMyStory ? { authorId: resolvedConvexUserId } : "skip",
  );

  // -- Local State --
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<Video>(null);
  
  // -- Bottom Sheet --
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // -- Reanimated Values --
  const translateY = useSharedValue(0);
  const progress = useSharedValue(0);

  const current = stories && stories.length > 0 ? stories[index] : undefined;
  
  // -- Handlers --
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const closeViewer = () => {
    "worklet";
    runOnJS(handleBack)();
  };

  const nextStory = useCallback(() => {
    if (stories && index < stories.length - 1) {
      setIndex((i) => i + 1);
    } else {
      router.back();
    }
  }, [stories, index, router]);

  const prevStory = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // -- Gestures --
  const panGesture = Gesture.Pan()
    .onChange((e) => {
      if (e.changeY > 0) {
        translateY.value += e.changeY;
      }
    })
    .onEnd((e) => {
      if (translateY.value > 100 || e.velocityY > 500) {
        // Swipe down to close
        translateY.value = withTiming(SCREEN_HEIGHT, {}, () => {
          closeViewer();
        });
      } else {
        // Spring back
        translateY.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // -- Progress Logic --
  useEffect(() => {
    if (!stories || stories.length === 0) return;
    
    // Reset progress on story change
    progress.value = 0;
    setIsVideoLoading(current?.mediaType === "video");
  }, [index, stories, current?.mediaType, progress]);

  useEffect(() => {
    // Record impression
    if (!isPaused && resolvedConvexUserId) {
        recordImpression({ authorId: resolvedConvexUserId as any }).catch((err) =>
          console.error("Failed to record impression:", err)
        );
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, resolvedConvexUserId, recordImpression]);

  useEffect(() => {
    if (!current || isPaused || isSheetOpen || isVideoLoading) {
      cancelAnimation(progress);
      return;
    }

    // Start progress animation
    progress.value = withTiming(1, {
      duration: 5000 * (1 - progress.value), // Adjusted for resume
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        runOnJS(nextStory)();
      }
    });

    return () => cancelAnimation(progress);
  }, [index, isPaused, isSheetOpen, isVideoLoading, current, nextStory, progress]);



  // -- Video Logic --
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.isBuffering) {
        setIsVideoLoading(true);
    } else {
        setIsVideoLoading(false);
    }
    
    if (status.didJustFinish) {
      
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
      />
    ),
    []
  );

  // -- Render --
  if (!stories) return null;
  if (stories.length === 0)
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <StatusBar barStyle="light-content" />
        <Ionicons name="images-outline" size={64} color={COLORS.gray} />
        <Text className="text-white mt-2.5 text-base">No active stories</Text>
        <TouchableOpacity onPress={handleBack} className="p-1.5 mt-5">
           <Text className="text-white font-bold">Close</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View className="flex-1 bg-black" style={animatedStyle}>
        <StatusBar barStyle="light-content" />
        
        {/* Media Content */}
        {current && current.mediaType === "video" ? (
          <Video
            ref={videoRef}
            source={{ uri: current.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={!isPaused && !isSheetOpen && !isVideoLoading && index < stories.length}
            isLooping={false} // Let timer handle finish
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        ) : current ? (
          <Image
            source={{ uri: current.imageUrl }}
            className="flex-1 w-full h-full"
            contentFit="contain"
            onLoadEnd={() => setIsVideoLoading(false)}
          />
        ) : null}

        {/* Progress Bars */}
        <View className="absolute top-12 left-3 right-3 flex-row items-center gap-1 z-[100]">
          {stories.map((_, i) => (
             <ProgressBar 
                key={i} 
                index={i} 
                currentIndex={index} 
                sharedProgress={progress} 
             />
          ))}
        </View>
        
        {/* Header Controls */}
        <View className="absolute top-12 right-3 left-3 mt-4 flex-row justify-between items-center z-[100]">
           {/* Close Button left aligned? No, standard is right */}
           <View className="flex-1" />
           <TouchableOpacity onPress={handleBack} className="p-2 bg-black/20 rounded-full">
             <Ionicons name="close" size={24} color="white" />
           </TouchableOpacity>
        </View>

        {/* Tap Objects */}
        <View className="absolute inset-0 flex-row z-10">
            <TouchableOpacity 
                className="flex-1"
                activeOpacity={1}
                onPress={() => {
                    prevStory();
                    if(resolvedConvexUserId) recordTap({ authorId: resolvedConvexUserId as any, direction: "back" });
                }}
                onLongPress={() => setIsPaused(true)}
                onPressOut={() => setIsPaused(false)}
            />
            <TouchableOpacity 
                className="flex-1"
                activeOpacity={1}
                onPress={() => {
                   nextStory();
                   if(resolvedConvexUserId) recordTap({ authorId: resolvedConvexUserId as any, direction: "forward" });
                }}
                onLongPress={() => setIsPaused(true)}
                onPressOut={() => setIsPaused(false)}
            />
        </View>

        {/* Footer / Viewers Trigger */}
        {isMyStory && (
            <View className="absolute bottom-10 inset-x-0 items-center z-50">
                <TouchableOpacity 
                    className="items-center py-2 px-4"
                    onPress={() => {
                        setIsSheetOpen(true);
                        setIsPaused(true);
                        bottomSheetRef.current?.expand();
                    }}
                >
                    <Ionicons name="chevron-up" size={24} color="white" />
                    <Text className="text-white font-bold text-sm">
                        {viewersData?.count || 0} Viewers
                    </Text>
                </TouchableOpacity>
            </View>
        )}

        {/* Viewers Bottom Sheet */}
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            onClose={() => {
                setIsSheetOpen(false);
                setIsPaused(false);
            }}
            backgroundStyle={{ backgroundColor: '#1a1a1a' }}
            handleIndicatorStyle={{ backgroundColor: '#555' }}
        >
            <View className="flex-1 px-4">
                <Text className="text-white font-bold text-lg mb-4 text-center">Viewers</Text>
                <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                     {(viewersData?.viewers || []).map((v) => (
                        <View key={String(v.viewerId)} className="flex-row items-center py-3 border-b border-white/10">
                            <Image 
                                source={{ uri: v.avatar || `https://ui-avatars.com/api/?name=${v.username}` }} 
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <View>
                                <Text className="text-white font-semibold">{v.username || "User"}</Text>
                                <Text className="text-gray-400 text-xs">{new Date(v.lastViewedAt).toLocaleTimeString()}</Text>
                            </View>
                            {v.replayCount > 0 && (
                                <View className="ml-auto bg-white/20 px-2 py-1 rounded">
                                    <Text className="text-white text-xs">{v.replayCount}x</Text>
                                </View>
                            )}
                        </View>
                     ))}
                </BottomSheetScrollView>
            </View>
        </BottomSheet>

      </Animated.View>
    </GestureDetector>
  );
}

// -- Separated Component for Optimised Rendering --
const ProgressBar = ({ index, currentIndex, sharedProgress }: { index: number, currentIndex: number, sharedProgress: Animated.SharedValue<number> }) => {
    const style = useAnimatedStyle(() => {
        let width = 0;
        if (index < currentIndex) width = 100;
        else if (index > currentIndex) width = 0;
        else width = sharedProgress.value * 100;
        
        return {
            width: `${width}%`
        };
    });

    return (
        <View className="flex-1 h-[2px] bg-white/30 rounded overflow-hidden">
            <Animated.View style={[style, { height: '100%', backgroundColor: 'white' }]} />
        </View>
    );
};
