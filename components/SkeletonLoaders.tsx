import { useEffect } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export function FeedSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-black">
      {/* Header Skeleton */}
      <View className="h-[54px] border-b border-neutral-800 px-4 flex-row items-center justify-between">
        <Animated.View
          style={animatedStyle}
          className="w-24 h-8 bg-neutral-800 rounded"
        />
        <View className="flex-row gap-4">
          <Animated.View
            style={animatedStyle}
            className="w-6 h-6 bg-neutral-800 rounded-full"
          />
          <Animated.View
            style={animatedStyle}
            className="w-6 h-6 bg-neutral-800 rounded-full"
          />
        </View>
      </View>

      {/* Stories Skeleton */}
      <View className="flex-row px-4 py-3 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Animated.View
            key={i}
            style={animatedStyle}
            className="w-16 h-16 bg-neutral-800 rounded-full"
          />
        ))}
      </View>

      {/* Post Skeletons */}
      {[1, 2].map((postIndex) => (
        <View key={postIndex} className="mb-4">
          {/* Post Header */}
          <View className="flex-row items-center px-4 py-3">
            <Animated.View
              style={animatedStyle}
              className="w-10 h-10 bg-neutral-800 rounded-full"
            />
            <View className="ml-3 flex-1">
              <Animated.View
                style={animatedStyle}
                className="w-32 h-4 bg-neutral-800 rounded mb-1"
              />
              <Animated.View
                style={animatedStyle}
                className="w-20 h-3 bg-neutral-800 rounded"
              />
            </View>
          </View>

          {/* Post Image */}
          <Animated.View
            style={[animatedStyle, { width, height: width }]}
            className="bg-neutral-800"
          />

          {/* Post Actions */}
          <View className="flex-row px-4 py-3 gap-4">
            <Animated.View
              style={animatedStyle}
              className="w-6 h-6 bg-neutral-800 rounded"
            />
            <Animated.View
              style={animatedStyle}
              className="w-6 h-6 bg-neutral-800 rounded"
            />
            <Animated.View
              style={animatedStyle}
              className="w-6 h-6 bg-neutral-800 rounded"
            />
          </View>

          {/* Post Caption */}
          <View className="px-4">
            <Animated.View
              style={animatedStyle}
              className="w-full h-3 bg-neutral-800 rounded mb-2"
            />
            <Animated.View
              style={animatedStyle}
              className="w-3/4 h-3 bg-neutral-800 rounded"
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function InboxSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-black">
      {/* Header Skeleton */}
      <View className="h-[54px] border-b border-neutral-800 px-4 flex-row items-center justify-between">
        <Animated.View
          style={animatedStyle}
          className="w-32 h-8 bg-neutral-800 rounded"
        />
        <View className="flex-row gap-4">
          <Animated.View
            style={animatedStyle}
            className="w-6 h-6 bg-neutral-800 rounded-full"
          />
          <Animated.View
            style={animatedStyle}
            className="w-6 h-6 bg-neutral-800 rounded-full"
          />
        </View>
      </View>

      {/* Chat List Skeletons */}
      <View className="p-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <View key={i} className="flex-row items-center mb-5">
            <Animated.View
              style={animatedStyle}
              className="w-14 h-14 bg-neutral-800 rounded-full"
            />
            <View className="flex-1 ml-3.5">
              <Animated.View
                style={animatedStyle}
                className="w-32 h-4 bg-neutral-800 rounded mb-2"
              />
              <Animated.View
                style={animatedStyle}
                className="w-48 h-3 bg-neutral-800 rounded"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-black">
      {/* Header Skeleton */}
      <View className="h-[54px] border-b border-neutral-800 px-4 flex-row items-center justify-between">
        <Animated.View
          style={animatedStyle}
          className="w-24 h-6 bg-neutral-800 rounded"
        />
      </View>

      {/* Profile Info */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center mb-4">
          <Animated.View
            style={animatedStyle}
            className="w-20 h-20 bg-neutral-800 rounded-full"
          />
          <View className="flex-1 flex-row justify-around ml-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="items-center">
                <Animated.View
                  style={animatedStyle}
                  className="w-12 h-5 bg-neutral-800 rounded mb-1"
                />
                <Animated.View
                  style={animatedStyle}
                  className="w-16 h-3 bg-neutral-800 rounded"
                />
              </View>
            ))}
          </View>
        </View>

        <Animated.View
          style={animatedStyle}
          className="w-32 h-4 bg-neutral-800 rounded mb-2"
        />
        <Animated.View
          style={animatedStyle}
          className="w-full h-3 bg-neutral-800 rounded mb-1"
        />
        <Animated.View
          style={animatedStyle}
          className="w-3/4 h-3 bg-neutral-800 rounded mb-4"
        />

        {/* Action Buttons */}
        <View className="flex-row gap-2 mb-4">
          <Animated.View
            style={animatedStyle}
            className="flex-1 h-8 bg-neutral-800 rounded-lg"
          />
          <Animated.View
            style={animatedStyle}
            className="flex-1 h-8 bg-neutral-800 rounded-lg"
          />
        </View>
      </View>

      {/* Post Grid */}
      <View className="flex-row flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Animated.View
            key={i}
            style={[
              animatedStyle,
              { width: (width - 2) / 3, height: (width - 2) / 3 },
            ]}
            className="bg-neutral-800 border border-black"
          />
        ))}
      </View>
    </View>
  );
}

export function BookmarksSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const ITEM_SIZE = width / 3;

  return (
    <View className="flex-1 bg-black">
      {/* Header Skeleton */}
      <View className="h-[54px] border-b border-neutral-800 px-4 flex-row items-center justify-between">
        <Animated.View
          style={animatedStyle}
          className="w-32 h-6 bg-neutral-800 rounded"
        />
        <Animated.View
          style={animatedStyle}
          className="w-6 h-6 bg-neutral-800 rounded-full"
        />
      </View>

      {/* Grid Skeleton */}
      <View className="flex-row flex-wrap">
        {Array.from({ length: 15 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              animatedStyle,
              { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
            ]}
          >
            <View className="w-full h-full bg-neutral-800" />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
