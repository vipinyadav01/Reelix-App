import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface ProfileData {
  user: any;
  posts: any[];
  stories: any[];
  followStatus: {
    followStatus: 'following' | 'not_following' | 'pending';
    mutualFollow: boolean;
  } | null;
}

interface UseProfileScreenReturn {
  profileData: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  followStatus: string | null;
  isOwnProfile: boolean;
  handleFollowToggle: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  handleEditProfile: () => void;
  handleMessage: () => void;
}

export function useProfileScreen(
  targetUserId: string | undefined,
  currentUserId: string | undefined
): UseProfileScreenReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Queries
  const targetUser = useQuery(api.user.getUserByClerkId, 
    targetUserId ? { clerkId: targetUserId } : "skip"
  );
  
  const currentUser = useQuery(api.user.getUserByClerkId, 
    currentUserId ? { clerkId: currentUserId } : "skip"
  );

  const relationshipData = useQuery(
    api.user.getRelationshipData,
    targetUser && targetUser._id ? { targetId: targetUser._id } : "skip"
  );

  const userPosts = useQuery(
    api.posts.getUserPosts,
    targetUser && targetUser._id ? { userId: targetUser._id } : "skip"
  );

  const userStories = useQuery(
    api.stories.getUserStories,
    targetUser && targetUser._id ? { userId: targetUser._id } : "skip"
  );

  // Mutations
  const toggleFollow = useMutation(api.user.toggleFollow);
  const respondToFollowRequest = useMutation(api.user.respondToFollowRequest);

  const isOwnProfile = Boolean(
    targetUserId && 
    currentUserId && 
    targetUserId === currentUserId
  );

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!targetUserId) {
          setError('User ID is required');
          return;
        }

        if (!targetUser) {
          setError('User not found');
          return;
        }

        const data: ProfileData = {
          user: targetUser,
          posts: userPosts || [],
          stories: userStories || [],
          followStatus: relationshipData || null,
        };

        setProfileData(data);
      } catch (err) {
        console.error('Error initializing profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [targetUserId, targetUser, userPosts, userStories, relationshipData]);

  const handleFollowToggle = useCallback(async () => {
    if (!currentUser || !targetUser || isOwnProfile) return;

    try {
      setIsLoading(true);

      const currentFollowStatus = relationshipData?.followStatus === 'following';
      
      if (currentFollowStatus) {
        // Unfollow
        await toggleFollow({
          targetUserId: targetUser._id,
        });
      } else {
        // Follow
        await toggleFollow({
          targetUserId: targetUser._id,
        });
      }

      // Refresh relationship data
      await handleRefresh();
      
    } catch (err) {
      console.error('Error toggling follow:', err);
      Alert.alert(
        'Error',
        'Failed to update follow status. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, targetUser, isOwnProfile, relationshipData, toggleFollow]);

  const handleRefresh = useCallback(async () => {
    try {
      // The queries will automatically refetch when dependencies change
      // This is handled by Convex's reactive system
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile');
    }
  }, []);

  const handleEditProfile = useCallback(() => {
    router.push('/profile/edit');
  }, [router]);

  const handleMessage = useCallback(() => {
    if (!targetUser) return;
    
    // Navigate to chat/message screen
    router.push(`/chat/${targetUser._id}` as any);
  }, [targetUser, router]);

  return {
    profileData,
    isLoading,
    error,
    followStatus: relationshipData?.followStatus || null,
    isOwnProfile,
    handleFollowToggle,
    handleRefresh,
    handleEditProfile,
    handleMessage,
  };
}
