import { theme } from "@/constants/theme";
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.dark,
  },
  brandSection: {
    alignItems: "center",
    marginTop: height * 0.1,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 40,
    fontWeight: "700",
    fontFamily: "JetBrainsMono-Medium",
    color: theme.color.reactBlue.light,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    color: theme.color.textSecondary.dark,
    letterSpacing: 0.5,
    textTransform: "lowercase",
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    maxHeight: 260,
  },
  loginSection: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colorWhite,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 16,
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.color.backgroundSecondary.dark,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorBlack,
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: theme.color.textSecondary.dark,
    maxWidth: 280,
  },
});
