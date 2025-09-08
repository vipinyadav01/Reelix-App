import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/feed.styles";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { View, Text, ScrollView, StatusBar, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useEffect } from "react";

export default function Bookmarks() {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    // Animate header on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

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
        <Text style={styles.headerTitle}>Bookmarks</Text>
        <View style={styles.headerRight}>
          <Ionicons name="bookmark" size={24} color={COLORS.white} />
        </View>
      </Animated.View>

      {/* ENHANCED POSTS GRID */}
      <Animated.View 
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 8,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
          showsVerticalScrollIndicator={false}
        >
          {bookmarkedPosts.map((post, index) => {
            if (!post) return null;
            return (
              <Animated.View 
                key={post._id} 
                style={{ 
                  width: "33.33%", 
                  padding: 2,
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [index * 20, 0],
                    })
                  }],
                }}
              >
                <View style={styles.bookmarkImageContainer}>
                  <Image
                    source={post.imageUrl}
                    style={styles.bookmarkImage}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.bookmarkOverlay}>
                    <Ionicons name="bookmark" size={16} color={COLORS.white} />
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function NoBookmarksFound() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Continuous pulse animation
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <View style={[styles.container, styles.centered]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <Animated.View 
        style={[
          styles.bheader,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.bheaderTitle}>Bookmarks</Text>
        <View style={styles.bheaderRight}>
          <Ionicons name="bookmark" size={24} color={COLORS.primary} />
        </View>
      </Animated.View>
      <Animated.View 
        style={[
          styles.emptyStateContainer, 
          { 
            transform: [{ scale: pulseAnim }],
            opacity: fadeAnim 
          }
        ]}
      >
        <View style={styles.emptyIconContainer}>
          <Ionicons name="bookmark-outline" size={64} color={COLORS.white} />
        </View>
        <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
        <Text style={styles.emptySubtitle}>
          Save posts you love by tapping the bookmark icon. They'll appear here for easy access later.
        </Text>
      </Animated.View>
    </View>
  );
}