import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { styles } from '@/styles/profile.styles';
import { useProfileIntegration } from '@/hooks/useProfileIntegration';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user: currentUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const {
    profileData,
    isLoading,
    error,
    isOwnProfile,
    handleFollowToggle,
    handleRefresh,
    handleEditProfile,
    handleMessage,
  } = useProfileIntegration({
    targetUserId: userId,
    currentUserId: currentUser?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await handleRefresh();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profileData) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Ionicons name="alert-circle" size={64} color={COLORS.gray} />
        <Text style={styles.errorTitle}>Profile Not Found</Text>
        <Text style={styles.errorSubtitle}>
          {error || 'This profile could not be loaded.'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { user, posts, stories, followStatus: relationshipStatus } = profileData;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isOwnProfile ? 'Your Profile' : user?.username || 'Profile'}
        </Text>
        
        {isOwnProfile ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="settings" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleMessage}
          >
            <Ionicons name="chatbubble" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.white]}
            progressBackgroundColor={COLORS.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user?.imageUrl || user?.image }}
                style={styles.avatar}
              />
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.addStoryButton}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Ionicons name="add" size={16} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{posts?.length || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.username}>@{user?.username}</Text>
            {user?.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  relationshipStatus?.followStatus === 'following' && styles.unfollowButton
                ]}
                onPress={handleFollowToggle}
                disabled={isLoading}
              >
                <Text style={[
                  styles.followButtonText,
                  relationshipStatus?.followStatus === 'following' && styles.unfollowButtonText
                ]}>
                  {relationshipStatus?.followStatus === 'following' ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessage}
              >
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {isOwnProfile && (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stories Section */}
        {stories && stories.length > 0 && (
          <View style={styles.storiesSection}>
            <Text style={styles.sectionTitle}>Stories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesContainer}
            >
              {stories.map((story, index) => (
                <TouchableOpacity
                  key={story._id}
                  style={styles.storyItem}
                  onPress={() => router.push(`/story/${story._id}` as any)}
                >
                  <Image
                    source={{ uri: story.imageUrl }}
                    style={styles.storyThumbnail}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {posts && posts.length > 0 ? (
            <View style={styles.postsGrid}>
              {posts.map((post, index) => (
                <TouchableOpacity
                  key={post._id}
                  style={styles.postItem}
                  onPress={() => router.push(`/post/${post._id}` as any)}
                >
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.postThumbnail}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPostsContainer}>
              <Ionicons name="images-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyPostsText}>
                {isOwnProfile ? 'No posts yet' : 'No posts to show'}
              </Text>
              {isOwnProfile && (
                <TouchableOpacity
                  style={styles.createPostButton}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Text style={styles.createPostButtonText}>Create Your First Post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
