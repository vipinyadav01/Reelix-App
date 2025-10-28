import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments, Slot } from "expo-router";
import { useEffect, useState } from "react";
import { useUserSync } from "@/hooks/useUserSync";
import { View, Text } from "react-native";
import { theme } from "@/constants/theme";
import { Loader } from "@/components/Loader";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoading: userSyncLoading, timeoutReached } = useUserSync();
  const [navigationReady, setNavigationReady] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  // Ensure navigation is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Simplified navigation logic
  useEffect(() => {
    if (!isLoaded || !navigationReady) {
      return;
    }

    const currentPath = segments.join("/");
    const isAuthScreen = segments[0] === "(auth)";
    const isIndexScreen = currentPath === "" || segments[0] === undefined;

    // If not signed in and not on auth screen, redirect to login
    if (!isSignedIn && !isAuthScreen) {
      router.replace("/(auth)/login");
      return;
    }

    // If signed in and on auth screen or index, redirect to tabs
    if (isSignedIn && (isAuthScreen || isIndexScreen)) {
      router.replace("/(tabs)");
      return;
    }
  }, [isLoaded, isSignedIn, segments, navigationReady, router]);

  // Show loading while Clerk is initializing
  if (!isLoaded || !navigationReady) {
    return <Loader />;
  }

  // Show loading while syncing user data (only for signed in users not on valid screens)
  const isOnValidScreen = segments[0] === "(tabs)" || segments[0] === "(auth)";
  if (isSignedIn && userSyncLoading && !isOnValidScreen && !timeoutReached) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.color.background.dark,
        }}
      >
        <Text style={{ color: theme.colorWhite, marginBottom: 20 }}>
          Setting up your account...
        </Text>
        <Loader />
      </View>
    );
  }

  // Render the actual page content with a dark background wrapper
  return (
    <View style={{ flex: 1, backgroundColor: theme.color.background.dark }}>
      <Slot />
    </View>
  );
}
