import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  addStoryButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 4,
  },
  userInfo: {
    marginBottom: 16,
  },
  displayName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  bio: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  followButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  unfollowButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  followButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  unfollowButtonText: {
    color: COLORS.white,
  },
  messageButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  messageButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  editProfileButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  editProfileButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  storiesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  storiesContainer: {
    paddingHorizontal: 16,
  },
  storyItem: {
    marginRight: 12,
  },
  storyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  postsSection: {
    marginBottom: 24,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  postItem: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    marginRight: 6,
    marginBottom: 6,
  },
  postThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  emptyPostsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyPostsText: {
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  createPostButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createPostButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});