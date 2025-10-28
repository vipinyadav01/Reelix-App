import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { useUserSync } from "@/hooks/useUserSync";
import { View, Text, useColorScheme } from "react-native"; // Import useColorScheme
import { theme } from "@/constants/theme";
import { Loader } from "@/components/Loader";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading: userSyncLoading, timeoutReached } = useUserSync();
  const [navigationReady, setNavigationReady] = useState(false);

  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === "dark";
  const dynamicBackgroundColor = isDark ? theme.color.background.dark : theme.color.background.light;
  const dynamicTextColor = isDark ? theme.colorWhite : theme.colorBlack; // For text

  useEffect(() => {
    const timer = setTimeout(() => {
      setNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded || !navigationReady) {
      return;
    }

    const currentPath = segments.join("/");
    const isAuthScreen = segments[0] === "(auth)";
    const isIndexScreen = currentPath === "" || segments[0] === undefined;
    if (!isSignedIn && !isAuthScreen) {
      router.replace("/(auth)/login");
      return;
    }

    if (isSignedIn && (isAuthScreen || isIndexScreen)) {
      router.replace("/(tabs)");
      return;
    }
  }, [isLoaded, isSignedIn, segments, navigationReady, router]);
  if (!isLoaded || !navigationReady) {
    return <Loader />;
  }
  const isOnValidScreen = segments[0] === "(tabs)" || segments[0] === "(auth)";
  if (isSignedIn && userSyncLoading && !isOnValidScreen && !timeoutReached) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: dynamicBackgroundColor,
        }}
      >
        <Text style={{ color: dynamicTextColor, marginBottom: 20 }}>
          Setting up your account...
        </Text>
        <Loader />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: dynamicBackgroundColor }}>
      <Slot />
    </View>
  );
}