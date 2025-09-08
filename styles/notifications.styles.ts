import { StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    color: COLORS.white,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  iconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  notificationInfo: {
    flex: 1,
  },
  username: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  action: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 2,
  },
  timeAgo: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  notificationCount: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.surface,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  // Empty State Styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 320,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#222222',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
});