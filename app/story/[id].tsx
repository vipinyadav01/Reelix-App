import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StatusBar, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
let Video: any;
try {
  Video = require('expo-av').Video;
} catch (e) {
  Video = null;
}
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';


export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isStringId = typeof id === 'string';
  const isLikelyConvexId = isStringId && (id as string).length > 10 && !(id as string).startsWith('user_');
  const isLikelyClerkId = isStringId && (id as string).startsWith('user_');

  const clerkUser = useQuery(api.user.getUserByClerkId, isLikelyClerkId ? { clerkId: id as string } : 'skip');
  const resolvedConvexUserId = isLikelyConvexId ? (id as any) : (clerkUser?._id as any | undefined);
  const stories = useQuery(api.stories.getUserStories, resolvedConvexUserId ? { userId: resolvedConvexUserId } : 'skip');
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!stories || stories.length === 0) return;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (index < stories.length - 1) setIndex((i) => i + 1);
      else router.back();
    }, 5000);
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [stories, index]);

  if (!stories) return null;
  if (stories.length === 0) return (
    <View style={styles.containerCenter}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.emptyText}>No active stories</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeButtonTouch}>
        <Ionicons name="close" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const current = stories[index];
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {current.mediaType === 'video' && Video ? (
        <Video
          source={{ uri: current.imageUrl }}
          style={styles.media}
          resizeMode="contain"
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status: any) => {
            if (status?.isLoaded && status?.didJustFinish) {
              if (index < stories.length - 1) setIndex((i) => i + 1);
              else router.back();
            }
          }}
        />
      ) : (
        <Image source={{ uri: current.imageUrl }} style={styles.media} contentFit="contain" />
      )}

      <View style={styles.topBar}>
        <View style={styles.progressContainer}>
          {stories.map((_, i) => (
            <View key={i} style={[styles.progressSegment, i <= index && styles.progressSegmentActive]} />
          ))}
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButtonTouch}>
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.navZones}>
        <TouchableOpacity style={styles.navZone} onPress={() => setIndex((i) => Math.max(0, i - 1))} />
        <TouchableOpacity style={styles.navZone} onPress={() => setIndex((i) => Math.min(stories.length - 1, i + 1))} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  containerCenter: {
    flex: 1,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 32,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginRight: 12,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.white,
  },
  closeButtonTouch: {
    padding: 6,
  },
  navZones: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navZone: {
    flex: 1,
    height: 200,
  },
  emptyText: {
    color: COLORS.white,
  },
});


