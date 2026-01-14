import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export default function SplashScreen() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.4, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Animated.Text 
        style={animatedStyle}
        className="text-[56px] font-bold italic text-white mb-2"
      >
        Reelix
      </Animated.Text>
      <Text className="text-sm text-neutral-400 tracking-[2px] uppercase">
        Share Your Moments
      </Text>
    </View>
  );
}
