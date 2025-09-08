import { Loader } from "@/components/Loader";
import Post from "@/components/Post";
import StoriesSection from "@/components/Stories";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View, StatusBar, Animated, Alert } from "react-native";
import { styles } from "../../styles/feed.styles";
import { useState, useRef, useEffect } from "react";

export default function Index() {
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const posts = useQuery(api.posts.getFeedPosts);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => signOut() },
      ]
    );
  };

  if (posts === undefined) return <Loader />;
  const safePosts = posts.filter((p): p is NonNullable<typeof p> => p != null);
  if (safePosts.length === 0) return <NoPostsFound />;

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh with haptic feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* ENHANCED HEADER */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Reelix</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>BETA</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* ENHANCED FEED */}
      <FlatList
        data={safePosts}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <Post post={item} />
          </Animated.View>
        )}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
        ListHeaderComponent={
          <Animated.View style={{ opacity: fadeAnim }}>
            <StoriesSection />
          </Animated.View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.surface}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
      />
    </View>
  );
}

const NoPostsFound = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <View style={styles.noPostsContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.noPostsGradient}>
        <Animated.View style={[styles.noPostsContent, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.noPostsIconContainer}>
            <Ionicons name="camera-outline" size={64} color={COLORS.white} />
          </View>
          <Text style={styles.noPostsTitle}>No Posts Yet</Text>
          <Text style={styles.noPostsSubtitle}>
            Be the first to share something amazing!
          </Text>
          <TouchableOpacity style={styles.createPostButton} activeOpacity={0.8}>
            <View style={styles.createPostGradient}>
              <Ionicons name="add" size={20} color={COLORS.black} />
              <Text style={styles.createPostText}>Create Post</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};