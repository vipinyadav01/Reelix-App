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
} from "react-native";
import { COLORS } from "@/constants/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useNotificationsSimple as useNotifications } from "@/hooks/useNotificationsSimple";

// Minimal type to satisfy VectorIcon family typing
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

  const tintColor = isDark ? COLORS.white : COLORS.black;
  const inactiveTintColor = isDark ? "#FFFFFF90" : "#00000090";

  const labelSelectedStyle = Platform.OS === "ios" ? { color: tintColor } : undefined;

  return (
    <NativeTabs
      badgeBackgroundColor={tintColor}
      labelStyle={{
        color:
          Platform.OS === "ios" && isLiquidGlassAvailable()
            ? DynamicColorIOS({
                light: COLORS.black,
                dark: COLORS.white,
              })
            : inactiveTintColor,
      }}
      iconColor={
        Platform.OS === "ios" && isLiquidGlassAvailable()
          ? DynamicColorIOS({
              light: COLORS.black,
              dark: COLORS.white,
            })
          : inactiveTintColor
      }
      tintColor={
        Platform.OS === "ios"
          ? DynamicColorIOS({ light: COLORS.primary, dark: COLORS.white })
          : inactiveTintColor
      }
      labelVisibilityMode="labeled"
      indicatorColor={tintColor + "25"}
      disableTransparentOnScrollEdge={true}
    >
      <NativeTabs.Trigger name="index">
        {Platform.select({
          ios: <Icon sf="house" />,
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

      <NativeTabs.Trigger name="bookmarks">
        {Platform.select({
          ios: <Icon sf="bookmark" selectedColor={tintColor} />,
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
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        {Platform.select({
          ios: <Icon sf="plus.circle" />,
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

      <NativeTabs.Trigger name="notification" role={isLiquidGlassAvailable() ? "search" : undefined}>
        {Platform.select({
          ios: <Icon sf="heart" />,
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
        {unreadCount > 0 && !isLiquidGlassAvailable() && (
          <Badge>{unreadCount > 99 ? "99+" : String(unreadCount)}</Badge>
        )}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        {Platform.select({
          ios: <Icon sf="person" />,
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
  );
}