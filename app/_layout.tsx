// eslint-disable-next-line import/no-duplicates
import "react-native-gesture-handler";
import "../global.css";
import React, { useCallback, useEffect } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";

import { GestureHandlerRootView } from "react-native-gesture-handler"; // eslint-disable-line import/no-duplicates
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import CustomSplashScreen from "@/components/SplashScreen";
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return <CustomSplashScreen />;
  }

  return (
    <ClerkAndConvexProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <SafeAreaView
              style={{ flex: 1, backgroundColor: "#000" }}
              onLayout={onLayoutRootView}
            >
              <InitialLayout />
            </SafeAreaView>
            <StatusBar style="dark" />
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ClerkAndConvexProvider>
  );
}
