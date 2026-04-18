import { useEffect } from "react";
import { ActivityIndicator, Image, Platform, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

export default function SplashScreen() {
  const logoOpacity = useSharedValue(0.85);
  const logoScale = useSharedValue(1);
  const isIOS = Platform.OS === "ios";

  const SwiftUI = isIOS ? require("@expo/ui/swift-ui") : null;

  useEffect(() => {
    logoOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );

    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Animated.View style={animatedStyle}>
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
      </Animated.View>
      {isIOS && SwiftUI ? (
        <SwiftUI.Host matchContents style={{ marginTop: 18 }}>
          <SwiftUI.ProgressView />
        </SwiftUI.Host>
      ) : (
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
          style={{ marginTop: 18 }}
        />
      )}
      <Text className="text-xs text-neutral-400 tracking-[1px] uppercase mt-4">
        Loading Reelix
      </Text>
    </View>
  );
}
