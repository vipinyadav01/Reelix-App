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
  View,
} from "react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useNotificationsSimple as useNotifications } from "@/hooks/useNotificationsSimple";
import { theme } from "@/constants/theme";

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
    <View style={{ flex: 1, backgroundColor: theme.background }} >
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
        {/* Home - Feed */}
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

        {/* Explore */}
        <NativeTabs.Trigger name="bookmarks">
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="compass-outline"
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
                    name="compass-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Explore</Label>
        </NativeTabs.Trigger>

        {/* Create */}
        <NativeTabs.Trigger name="create">
          {Platform.select({
            ios: (
              <Icon
                src={
                  <VectorIcon
                    family={MaterialCommunityIcons as VectorIconFamily}
                    name="plus-circle"
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
                    name="plus-circle"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Create</Label>
        </NativeTabs.Trigger>

        {/* Notifications */}
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
                    name="account-circle-outline"
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
                    name="account-circle-outline"
                  />
                }
                selectedColor={tintColor}
              />
            ),
          })}
          <Label selectedStyle={labelSelectedStyle}>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}