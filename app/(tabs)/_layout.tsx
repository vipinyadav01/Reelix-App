import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Badge,
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import React from "react";
import {
  ColorValue,
  ImageSourcePropType,
  Platform,
  DynamicColorIOS,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useNotificationsSimple as useNotifications } from "@/hooks/useNotificationsSimple";
import { theme } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

type VectorIconFamily = {
  getImageSource: (
    name: string,
    size: number,
    color: ColorValue,
  ) => Promise<ImageSourcePropType>;
};

export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { unreadCount } = useNotifications();

  const tintColor = isDark ? theme.colorWhite : theme.colorBlack;
  const inactiveTintColor = isDark ? "#FFFFFF90" : "#00000090";

  const labelSelectedStyle = Platform.OS === "ios" ? { color: tintColor } : undefined;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.containerDark}>
      <NativeTabs
        badgeBackgroundColor={tintColor}
        labelStyle={{
          color:
            Platform.OS === "ios" && isLiquidGlassAvailable()
              ? DynamicColorIOS({
                  light: theme.colorBlack,
                  dark: theme.colorWhite,
                })
              : inactiveTintColor,
        }}
        iconColor={
          Platform.OS === "ios" && isLiquidGlassAvailable()
            ? DynamicColorIOS({
                light: theme.colorBlack,
                dark: theme.colorWhite,
              })
            : inactiveTintColor
        }
        tintColor={
          Platform.OS === "ios"
            ? DynamicColorIOS({ light: theme.color.reactBlue.light, dark: theme.color.reactBlue.dark })
            : inactiveTintColor
        }
        labelVisibilityMode="labeled"
        indicatorColor={tintColor + "25"}
        disableTransparentOnScrollEdge={true}
      >
        {/* Home */}
        <NativeTabs.Trigger name="index">
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="home-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="home-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Home</Label>
        </NativeTabs.Trigger>

        {/* Bookmarks */}
        <NativeTabs.Trigger name="bookmarks">
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="bookmark-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="bookmark-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Bookmarks</Label>
          {unreadCount > 0 && (
            <Badge>{unreadCount > 99 ? "99+" : String(unreadCount)}</Badge>
          )}
        </NativeTabs.Trigger>

        {/* Create */}
        <NativeTabs.Trigger name="create">
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="plus-circle-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="plus-circle-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Create</Label>
        </NativeTabs.Trigger>

        {/* Activity */}
        <NativeTabs.Trigger name="notification" role={isLiquidGlassAvailable() ? "search" : undefined}>
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="heart-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="heart-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Activity</Label>
          {unreadCount > 0 && (
            <Badge>{unreadCount > 99 ? "99+" : String(unreadCount)}</Badge>
          )}
        </NativeTabs.Trigger>

        {/* Profile */}
        <NativeTabs.Trigger name="profile">
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="account-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
            android: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="account-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerDark: { flex: 1, backgroundColor: theme.color.background.dark },
});