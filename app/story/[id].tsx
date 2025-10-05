import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StatusBar, TouchableOpacity, StyleSheet, PanResponder, Animated } from 'react-native';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
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
  const deleteStoryMutation = useMutation(api.stories.deleteStory);
  const viewersData = useQuery(
    api.stories.getStoryViewers,
    me && resolvedConvexUserId && String(me._id) === String(resolvedConvexUserId)
      ? { authorId: resolvedConvexUserId }
      : 'skip'
  );
  const [showViewers, setShowViewers] = useState(false);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<VideoView | null>(null);

  const translateY = useRef(new Animated.Value(0)).current;
  const segmentProgress = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer('');

  const current = stories && stories.length > 0 ? stories[index] : undefined;

  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    (async () => {
      if (current?.mediaType === 'video' && current.imageUrl) {
        try {
          await player.replaceAsync(current.imageUrl);
          if (cancelled) return;
          if (isPaused) {
            player.pause();
          } else {
            player.play();
          }
        } catch {}
      } else {
        player.pause();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [player, current?.mediaType, current?.imageUrl, isPaused]);

  useEffect(() => {
    if (!stories || stories.length === 0) return;

    if (!isPaused && resolvedConvexUserId) {
      recordImpression({ authorId: resolvedConvexUserId as any }).catch((err) =>
        console.error("Failed to record impression:", err)
      );
    }

    segmentProgress.stopAnimation();
    segmentProgress.setValue(0);

    if (!isPaused) {
      Animated.timing(segmentProgress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (!finished) return;
        if (stories && index < stories.length - 1) {
          setIndex((i) => i + 1);
        } else {
          router.back();
        }
      });
    }

    return () => {
      segmentProgress.stopAnimation();
    };
  }, [stories, index, isPaused, resolvedConvexUserId, router, segmentProgress]);

  useEffect(() => {
    if (isPaused) {
      segmentProgress.stopAnimation();
      return;
    }
    segmentProgress.stopAnimation((val?: number) => {
      const remaining = Math.max(0, 1 - (typeof val === 'number' ? val : 0));
      if (remaining === 0) return;
      Animated.timing(segmentProgress, {
        toValue: 1,
        duration: remaining * 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (!finished) return;
        if (stories && index < stories.length - 1) {
          setIndex((i) => i + 1);
        } else {
          router.back();
        }
      });
    });
  }, [isPaused]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy < -5;
    },
    onPanResponderGrant: (evt, gestureState) => {
      translateY.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy < 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy < -50) {
        setShowViewers(true);
        setIsPaused(true);
        Animated.timing(translateY, {
          toValue: -200,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
  }), [translateY]);


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



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {current && current.mediaType === 'video' ? (
        <VideoView
          ref={videoRef}
          style={styles.media}
          player={player}
          contentFit="contain"
        />
      ) : (
        current ? (
          <Image source={{ uri: current.imageUrl }} style={styles.media} contentFit="contain" />
        ) : null
      )}

      <View style={styles.topBar}>
        <View style={styles.progressContainer}>
          {stories.map((_, i) => {
            if (i < index) {
              return (
                <View key={i} style={styles.progressBarWrapper}>
                  <View style={[styles.progressBarTrack]} />
                  <View style={[styles.progressBarFill, { width: '100%' }]} />
                </View>
              );
            }
            if (i === index) {
              return (
                <View key={i} style={styles.progressBarWrapper}>
                  <View style={[styles.progressBarTrack]} />
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: segmentProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                </View>
              );
            }
            return (
              <View key={i} style={styles.progressBarWrapper}>
                <View style={[styles.progressBarTrack]} />
                <View style={[styles.progressBarFill, { width: '0%' }]} />
              </View>
            );
          })}
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButtonTouch}>
          <Ionicons name="close" size={24} color={COLORS.white} />
        </TouchableOpacity>
        {isLikelyConvexId && me && resolvedConvexUserId && String(me._id) === String(resolvedConvexUserId) && (
          <TouchableOpacity
            onPress={async () => {
              if (!current) return;
              try {
                await deleteStoryMutation({ storyId: current._id as any });
                if (index < (stories?.length || 1) - 1) {
                  setIndex((i) => i + 1);
                } else {
                  router.back();
                }
              } catch (e) {
                console.error('Failed to delete story', e);
              }
            }}
            style={styles.closeButtonTouch}
            accessibilityLabel="Delete story"
          >
            <Ionicons name="trash" size={22} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navZones}>
        <TouchableOpacity
          style={styles.navZone}
          onPress={() => {
            setIndex((i) => Math.max(0, i - 1));
            if (resolvedConvexUserId) recordTap({ authorId: resolvedConvexUserId as any, direction: 'back' }).catch((err) => console.error("Failed to record tap (back):", err));
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
            if (resolvedConvexUserId) recordTap({ authorId: resolvedConvexUserId as any, direction: 'forward' }).catch((err) => console.error("Failed to record tap (forward):", err));
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
          <TouchableOpacity style={styles.viewerHandle} onPress={() => { setShowViewers(true); setIsPaused(true); }}>
            <View style={styles.viewerPill} />
            <Text style={styles.viewerHint}>Swipe up to see viewers</Text>
          </TouchableOpacity>
        </View>
      )}

      {me && resolvedConvexUserId && String(me._id) === String(resolvedConvexUserId) && (
        <Animated.View
          style={[
            styles.swipeUpArea,
            { transform: [{ translateY: translateY }] }
          ]}
          {...panResponder.panHandlers}
        />
      )}

      {showViewers && (
        <View style={styles.viewersModalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => { setShowViewers(false); setIsPaused(false); }} />
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
                  {v.avatar ? (
                    <Image source={{ uri: v.avatar }} style={styles.viewerAvatar} contentFit="cover" />
                  ) : (
                    <View style={styles.viewerAvatarFallback}>
                      <Ionicons name="person" size={24} color={COLORS.white} />
                    </View>
                  )}
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
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 32,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginRight: 12,
  },
  progressBarWrapper: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarTrack: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  closeButtonTouch: {
    padding: 6,
  },
  navZones: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navZone: {
    flex: 1,
    height: '100%',
  },
  emptyText: {
    color: COLORS.white,
    marginTop: 10,
    fontSize: 16,
  },
  viewerHandleArea: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
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
    zIndex: 50,
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
    maxHeight: '70%',
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
  viewerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  swipeUpArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
    zIndex: 20,
  },
});