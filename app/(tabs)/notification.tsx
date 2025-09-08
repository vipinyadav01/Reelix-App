import { Loader } from "@/components/Loader";
import Notification from "@/components/Notification";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/notifications.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { FlatList, Text, View, StatusBar, Animated, RefreshControl } from "react-native";
import { useRef, useEffect, useState } from "react";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  if (notifications === undefined) return <Loader />;
  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      

      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationCount}>{notifications.length}</Text>
        </View>
      </Animated.View>

      <FlatList
        data={notifications}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            }}
          >
            <Notification notification={item} />
          </Animated.View>
        )}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.white}
            colors={[COLORS.white]}
            progressBackgroundColor={COLORS.surface}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function NoNotificationsFound() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
      
      <Animated.View style={[styles.emptyStateContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="notifications-outline" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptySubtitle}>
          When someone interacts with your posts, you'll see notifications here
        </Text>
      </Animated.View>
    </View>
  );
}