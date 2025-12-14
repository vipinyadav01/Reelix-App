import { StyleSheet, Dimensions } from "react-native";
import { theme } from "@/constants/theme";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.background.dark,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.color.backgroundElement.dark,
    backgroundColor: theme.color.background.dark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: theme.color.reactBlue.light,
  },
  contentDisabled: {
    opacity: 0.7,
  },
  shareButton: {
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    backgroundColor: theme.colorWhite,
    borderRadius: 20,
  },
  shareText: {
    color: theme.colorBlack,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.color.backgroundElement.dark,
    borderRadius: 20,
  },
  progressContainer: {
    height: 3,
    backgroundColor: theme.color.backgroundElement.dark,
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colorWhite,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyImageContainer: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#333333",
    borderStyle: "dashed",
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#222222",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colorWhite,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.color.textSecondary.dark,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  selectImageButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectImageGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: theme.colorWhite,
    borderRadius: 25,
  },
  selectImageText: {
    color: theme.colorBlack,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Content Styles
  content: {
    // Removed flex: 1 to allow ScrollView to handle content height naturally
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageSection: {
    width: width,
    height: width, // Default, but overridden by dynamic styles
    backgroundColor: theme.color.backgroundElement.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    // height: "100%", // Let height be determined by aspect ratio
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  postedIndicator: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  postedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  postedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 16,
  },
  changeImageButton: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    gap: 8,
  },
  changeImageButtonInner: {
    // Unused but kept for reference or removal
    flexDirection: "row",
    alignItems: "center",
  },
  changeImageText: {
    color: theme.colorWhite,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputSection: {
    padding: 20,
    // flex: 1, // Removed to allow natural height
  },
  captionContainer: {
    gap: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.color.backgroundElement.dark,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: theme.colorWhite,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userHandle: {
    color: theme.color.textSecondary.dark,
    fontSize: 14,
  },
  inputWrapper: {
    backgroundColor: theme.color.backgroundElement.dark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.color.backgroundSecondary.dark,
  },
  captionInput: {
    color: theme.colorWhite,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 24,
  },
  characterCount: {
    color: theme.color.textSecondary.dark,
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
});
