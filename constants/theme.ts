import * as Device from "expo-device";

const SPACE_SCALE = 1.33;
const FONT_SCALE = 1.2;
const isIpad = Device.osName === "iPadOS";

export const spaceScale = (value: number) =>
  isIpad ? Math.round(value * SPACE_SCALE) : value;

const fontScale = (size: number) =>
  isIpad ? Math.round(size * FONT_SCALE) : size;

export const theme = {
  primary: "#009544",
  secondary: "#833AB4",
  accent: "#FD1D1D",
  background: "#000000",
  surface: "#121212",
  surfaceLight: "#1E1E1E",
  surfaceHover: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#666666",
  textInverse: "#000000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#8E8E93",
  grayLight: "#C7C7CC",
  grayDark: "#3A3A3C",
  success: "#31A24C",
  warning: "#FF9500",
  error: "#FF3B30",
  info: "#00D4FF",

  colorRed: "#FF3B30",
  colorWhite: "#FFFFFF",
  colorBlack: "#000000",
  colorLightGreen: "#34C759",
  colorDarkGreen: "#30D158",
  colorGrey: "#8E8E93",

  color: {
    reactBlue: {
      light: "#009544",
      dark: "#009544",
    },
    transparent: {
      light: "rgba(255,255,255,0)",
      dark: "rgba(0,0,0,0)",
    },
    text: {
      light: "#000000",
      dark: "#FFFFFF",
    },
    textSecondary: {
      light: "#65676B",
      dark: "#B0B0B0",
    },
    background: {
      light: "#FFFFFF",
      dark: "#000000",
    },
    backgroundSecondary: {
      light: "#F0F2F5",
      dark: "#121212",
    },
    backgroundTertiary: {
      light: "#FFFFFF",
      dark: "#1E1E1E",
    },
    backgroundElement: {
      light: "#F0F2F5",
      dark: "#121212",
    },
    border: {
      light: "#CED0D4",
      dark: "#262626",
    },
  },
  darkActiveContent: "rgba(255,255,255,0.15)",
  lightActiveContent: "rgba(0,0,0,0.08)",
  space2: spaceScale(2),
  space4: spaceScale(4),
  space8: spaceScale(8),
  space12: spaceScale(12),
  space16: spaceScale(16),
  space24: spaceScale(24),
  space32: spaceScale(32),
  space40: spaceScale(40),
  fontSize10: fontScale(10),
  fontSize12: fontScale(12),
  fontSize14: fontScale(14),
  fontSize16: fontScale(16),
  fontSize18: fontScale(18),
  fontSize20: fontScale(20),
  fontSize24: fontScale(24),
  fontSize28: fontScale(28),
  fontSize32: fontScale(32),
  fontSize34: fontScale(34),
  fontSize42: fontScale(42),
  fontFamilyLight: "Montserrat-Light",
  fontFamilyLightItalic: "Montserrat-LightItalic",
  fontFamily: "Montserrat-Medium",
  fontFamilyItalic: "Montserrat-MediumItalic",
  fontFamilySemiBold: "Montserrat-SemiBold",
  fontFamilySemiBoldItalic: "Montserrat-SemiBoldItalic",
  fontFamilyBold: "Montserrat-Bold",
  fontFamilyBoldItalic: "Montserrat-BoldItalic",
  borderRadius4: 4,
  borderRadius6: 6,
  borderRadius10: 10,
  borderRadius12: 12,
  borderRadius20: 20,
  borderRadius32: 32,
  borderRadius34: 34,
  borderRadius40: 40,
  borderRadius45: 45,
  borderRadius80: 80,

  dropShadow: {
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  },
  shadowSmall: {
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  shadowMedium: {
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.15)",
  },
  shadowLarge: {
    boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.2)",
  },
} as const;

export const COLORS = theme;
