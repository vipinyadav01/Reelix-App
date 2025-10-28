import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import InitialLayout from "@/components/InitialLayout";
import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import NotificationProvider from "@/providers/NotificationProvider";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, useColorScheme } from "react-native";

import { StatusBar } from "expo-status-bar";
import { SystemProvider } from "@/hooks/SystemProvider";
import { setBackgroundColorAsync } from "expo-system-ui";
import { theme } from "@/constants/theme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });
  const colorScheme = useColorScheme() || "light";

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync(colorScheme === "light" ? "dark" : "light");
    }
  }, [colorScheme]);

  useEffect(() => {
    setBackgroundColorAsync(
      colorScheme === "dark" ? theme.color.background.dark : theme.color.background.light
    );
  }, [colorScheme]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkAndConvexProvider>
      <SystemProvider>
        <NotificationProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <SafeAreaView
                  edges={["top", "left", "right"]}
                  style={{ flex: 1, backgroundColor: theme.color.background.dark }}
                  onLayout={onLayoutRootView}
                >
                  <InitialLayout />
                </SafeAreaView>
              </SafeAreaProvider>
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </GestureHandlerRootView>
          </ThemeProvider>
        </NotificationProvider>
      </SystemProvider>
    </ClerkAndConvexProvider>
  );
}
