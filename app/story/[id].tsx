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
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useAuth } from '@clerk/clerk-expo';


export default function StoryViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isStringId = typeof id === 'string';
  const isLikelyConvexId = isStringId && (id as string).length > 10 && !(id as string).startsWith('user_');
  const isLikelyClerkId = isStringId && (id as string).startsWith('user_');

  const clerkUser = useQuery(api.user.getUserByClerkId, isLikelyClerkId ? { clerkId: id as string } : 'skip');
  const resolvedConvexUserId = isLikelyConvexId ? (id as any) : (clerkUser?._id as any | undefined);
  const stories = useQuery(api.stories.getUserStories, resolvedConvexUserId ? { userId: resolvedConvexUserId } : 'skip');
  const { userId: clerkUserId } = useAuth();
  const me = useQuery(api.user.getUserByClerkId, clerkUserId ? { clerkId: clerkUserId } : 'skip');
  const recordImpression = useMutation(api.stories.recordImpression);
  const recordTap = useMutation(api.stories.recordTap);
  const viewersData = useQuery(api.stories.getStoryViewers, me && resolvedConvexUserId && String(me._id) === String(resolvedConvexUserId) ? { authorId: resolvedConvexUserId } : 'skip');
  const [showViewers, setShowViewers] = useState(false);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!stories || stories.length === 0) return;
    if (isPaused) return;
    if (resolvedConvexUserId) {
      recordImpression({ authorId: resolvedConvexUserId as any }).catch(() => {});
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (index < stories.length - 1) setIndex((i) => i + 1);
      else router.back();
    }, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stories, index, isPaused]);

  if (!stories) return null;
  if (stories.length === 0) return (
    <View style={styles.containerCenter}>
      <StatusBar barStyle="light-content" />
      <Ionicons name="images-outline" size={64} color={COLORS.gray} />
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
          shouldPlay={!isPaused}
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
        <TouchableOpacity
          style={styles.navZone}
          onPress={() => {
            setIndex((i) => Math.max(0, i - 1));
            if (resolvedConvexUserId) recordTap({ authorId: resolvedConvexUserId as any, direction: 'back' }).catch(() => {});
          }}
          onLongPress={() => {
            setIsPaused(true);
            if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = setInterval(() => {
              setIndex((i) => Math.max(0, i - 1));
            }, 600);
          }}
          onPressOut={() => {
            if (holdIntervalRef.current) {
              clearInterval(holdIntervalRef.current);
              holdIntervalRef.current = null;
            }
            setIsPaused(false);
          }}
          delayLongPress={200}
        />
        <TouchableOpacity
          style={styles.navZone}
          onPress={() => {
            setIndex((i) => Math.min(stories.length - 1, i + 1));
            if (resolvedConvexUserId) recordTap({ authorId: resolvedConvexUserId as any, direction: 'forward' }).catch(() => {});
          }}
          onLongPress={() => {
            setIsPaused(true);
            if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = setInterval(() => {
              setIndex((i) => Math.min(stories.length - 1, i + 1));
            }, 600);
          }}
          onPressOut={() => {
            if (holdIntervalRef.current) {
              clearInterval(holdIntervalRef.current);
              holdIntervalRef.current = null;
            }
            setIsPaused(false);
          }}
          delayLongPress={200}
        />
      </View>

      {me && resolvedConvexUserId && String(me._id) === String(resolvedConvexUserId) && (
        <View style={styles.viewerHandleArea}>
          <TouchableOpacity style={styles.viewerHandle} onPress={() => setShowViewers(true)}>
            <View style={styles.viewerPill} />
            <Text style={styles.viewerHint}>Swipe up to see viewers</Text>
          </TouchableOpacity>
        </View>
      )}

      {showViewers && (
        <View style={styles.viewersModalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowViewers(false)} />
          <View style={styles.viewersSheet}>
            <View style={styles.viewersHeader}>
              <Text style={styles.viewersTitle}>Viewers (24h)</Text>
              <Text style={styles.viewersCount}>{viewersData?.count || 0}</Text>
            </View>
            <View style={styles.viewersSubheader}>
              <Text style={styles.viewersMeta}>Replays: {viewersData?.totalReplays || 0}</Text>
            </View>
            <View style={styles.viewersList}>
              {(viewersData?.viewers || []).map((v) => (
                <View key={String(v.viewerId)} style={styles.viewerRow}>
                  <View style={styles.viewerAvatar} />
                  <View style={styles.viewerInfo}>
                    <Text style={styles.viewerName}>{v.username || 'User'}</Text>
                    <Text style={styles.viewerTime}>{new Date(v.lastViewedAt).toLocaleTimeString()}</Text>
                  </View>
                  {v.replayCount > 0 && (
                    <View style={styles.replayBadge}>
                      <Text style={styles.replayBadgeText}>{v.replayCount}x</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
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
  viewerHandleArea: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  viewerHandle: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  viewerPill: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 6,
  },
  viewerHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  viewersModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  viewersSheet: {
    backgroundColor: '#0d0d0d',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  viewersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  viewersTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  viewersCount: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  viewersSubheader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewersMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  viewersList: {
    paddingHorizontal: 8,
    paddingTop: 8,
    maxHeight: 320,
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  viewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 12,
  },
  viewerInfo: {
    flex: 1,
  },
  viewerName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  viewerTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  replayBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  replayBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});


