import * as Device from "expo-device";

const SPACE_SCALE = 1.33;
const FONT_SCALE = 1.2;
const isIpad = Device.osName === "iPadOS";

export const spaceScale = (value: number) =>
  isIpad ? Math.round(value * SPACE_SCALE) : value;

const fontScale = (size: number) =>
  isIpad ? Math.round(size * FONT_SCALE) : size;

export const theme = {
  primary: "#FFFFFF",
  secondary: "#FFFFFF",
  accent: "#FFFFFF",
  background: "#000000",
  surface: "#1C1C1E",
  surfaceLight: "#2C2C2E",
  surfaceHover: "#3A3A3C",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#636366",
  textInverse: "#000000",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#8E8E93",
  grayLight: "#C7C7CC",
  grayDark: "#48484A",
  success: "#32D74B",
  warning: "#FF9500",
  error: "#FF3B30",
  info: "#5AC8FA",

  colorRed: "#FF453A",
  colorWhite: "#FFFFFF",
  colorBlack: "#000000",
  colorLightGreen: "#32D74B",
  colorDarkGreen: "#30C158",
  colorGrey: "#8E8E93",

  color: {
    reactBlue: {
      light: "#FFFFFF",
      dark: "#FFFFFF",
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
      light: "#6D6D70",
      dark: "#8E8E93",
    },
    background: {
      light: "#FFFFFF",
      dark: "#000000",
    },
    backgroundSecondary: {
      light: "#F2F2F7",
      dark: "#1C1C1E",
    },
    backgroundTertiary: {
      light: "#FFFFFF",
      dark: "#2C2C2E",
    },
    backgroundElement: {
      light: "#F2F2F7",
      dark: "#1C1C1E",
    },
    border: {
      light: "#C6C6C8",
      dark: "#38383A",
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
