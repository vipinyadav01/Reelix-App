import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

interface ProfileEventHandlers {
  handleFeedUserImageClick: (userId: string) => void;
  handleFollowAction: (targetUserId: string) => Promise<void>;
  handleUnfollowAction: (targetUserId: string) => Promise<void>;
  handleMessageAction: (targetUserId: string) => void;
  handleBackNavigation: () => void;
  handleEditProfileNavigation: () => void;
  handleFollowStatusUpdate: (status: string) => void;
  handleUserStatusUpdate: (userId: string, status: string) => void;
  handleFollowError: (error: string) => void;
  handleProfileLoadError: (error: string) => void;
}

export function useProfileEvents(): ProfileEventHandlers {
  const router = useRouter();

  const handleFeedUserImageClick = useCallback((userId: string) => {
    try {
      router.push(`/profile/${userId}` as any);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to profile');
    }
  }, [router]);

  const handleFollowAction = useCallback(async (targetUserId: string) => {
    try {
      // This will be handled by the useProfileScreen hook
      console.log('Follow action triggered for user:', targetUserId);
    } catch (error) {
      console.error('Follow action error:', error);
      Alert.alert('Error', 'Failed to follow user');
    }
  }, []);

  const handleUnfollowAction = useCallback(async (targetUserId: string) => {
    try {
      // This will be handled by the useProfileScreen hook
      console.log('Unfollow action triggered for user:', targetUserId);
    } catch (error) {
      console.error('Unfollow action error:', error);
      Alert.alert('Error', 'Failed to unfollow user');
    }
  }, []);

  const handleMessageAction = useCallback((targetUserId: string) => {
    try {
      router.push(`/chat/${targetUserId}` as any);
    } catch (error) {
      console.error('Message navigation error:', error);
      Alert.alert('Error', 'Failed to open chat');
    }
  }, [router]);

  const handleBackNavigation = useCallback(() => {
    try {
      router.back();
    } catch (error) {
      console.error('Back navigation error:', error);
      router.push('/(tabs)');
    }
  }, [router]);

  const handleEditProfileNavigation = useCallback(() => {
    try {
      router.push('/profile/edit');
    } catch (error) {
      console.error('Edit profile navigation error:', error);
      Alert.alert('Error', 'Failed to open edit profile');
    }
  }, [router]);

  const handleFollowStatusUpdate = useCallback((status: string) => {
    console.log('Follow status updated:', status);
    // Real-time updates will be handled by Convex subscriptions
  }, []);

  const handleUserStatusUpdate = useCallback((userId: string, status: string) => {
    console.log('User status updated:', userId, status);
    // Real-time updates will be handled by Convex subscriptions
  }, []);

  const handleFollowError = useCallback((error: string) => {
    console.error('Follow error:', error);
    Alert.alert('Follow Error', error);
  }, []);

  const handleProfileLoadError = useCallback((error: string) => {
    console.error('Profile load error:', error);
    Alert.alert('Profile Error', error);
  }, []);

  return {
    handleFeedUserImageClick,
    handleFollowAction,
    handleUnfollowAction,
    handleMessageAction,
    handleBackNavigation,
    handleEditProfileNavigation,
    handleFollowStatusUpdate,
    handleUserStatusUpdate,
    handleFollowError,
    handleProfileLoadError,
  };
}
