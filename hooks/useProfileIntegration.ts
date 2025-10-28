import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProfileScreen } from "./useProfileScreen";
import { useProfileEvents } from "./useProfileEvents";
import { useSystemMonitoring } from "./useSystemMonitoring";

interface ProfileIntegrationOptions {
  targetUserId?: string;
  currentUserId?: string;
}

export function useProfileIntegration({
  targetUserId,
  currentUserId,
}: ProfileIntegrationOptions) {
  // --- Manager implementation (singleton) ---
  type FollowStatus = "following" | "not_following" | "pending";

  class ProfileIntegrationManager {
    private static instance: ProfileIntegrationManager | null = null;
    private initializedKeys: Set<string> = new Set();
    private followCache = new Map<
      string,
      { status: FollowStatus; ts: number }
    >();
    private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
    private initializationPromises = new Map<string, Promise<void>>();
    private readonly ttlMs = 5 * 60 * 1000; // 5 minutes
    private currentUserId: string | undefined;

    static getInstance() {
      if (!ProfileIntegrationManager.instance) {
        ProfileIntegrationManager.instance = new ProfileIntegrationManager();
      }
      return ProfileIntegrationManager.instance;
    }

    setCurrentUser(id: string | undefined) {
      this.currentUserId = id;
    }

    getKey(targetUserId: string) {
      return `${this.currentUserId}:${targetUserId}`;
    }

    isProfileIntegrated(targetUserId: string) {
      return this.initializedKeys.has(this.getKey(targetUserId));
    }

    async initializeProfile(targetUserId: string) {
      const key = this.getKey(targetUserId);
      if (this.isProfileIntegrated(targetUserId)) return;

      // If an initialization is already in-flight, wait for it
      const existing = this.initializationPromises.get(key);
      if (existing) {
        await existing;
        return;
      }

      const initPromise = (async () => {
        try {
          // Placeholder for any async setup needed
          // e.g., warm caches, prefetch essentials, subscribe once
          this.initializedKeys.add(key);
        } finally {
          // Ensure the promise is cleared regardless of outcome
          this.initializationPromises.delete(key);
        }
      })();

      this.initializationPromises.set(key, initPromise);
      await initPromise;
    }

    cleanupProfile(targetUserId: string) {
      this.initializedKeys.delete(this.getKey(targetUserId));
      const debKey = `follow:${targetUserId}`;
      const t = this.debounceTimers.get(debKey);
      if (t) clearTimeout(t);
      this.debounceTimers.delete(debKey);
    }

    debounce(key: string, fn: () => void, delayMs: number) {
      const prev = this.debounceTimers.get(key);
      if (prev) clearTimeout(prev);
      const t = setTimeout(fn, delayMs);
      this.debounceTimers.set(key, t);
    }

    getCachedFollow(targetUserId: string): FollowStatus | null {
      const entry = this.followCache.get(`fs:${targetUserId}`);
      if (!entry) return null;
      if (Date.now() - entry.ts > this.ttlMs) {
        this.followCache.delete(`fs:${targetUserId}`);
        return null;
      }
      return entry.status;
    }

    setCachedFollow(targetUserId: string, status: FollowStatus) {
      this.followCache.set(`fs:${targetUserId}`, { status, ts: Date.now() });
    }
  }

  const manager = useMemo(() => ProfileIntegrationManager.getInstance(), []);
  manager.setCurrentUser(currentUserId);

  // Initialize core profile system
  const profileScreen = useProfileScreen(targetUserId, currentUserId);
  const events = useProfileEvents();
  const monitoring = useSystemMonitoring({
    currentUserId,
    targetUserId,
    onFollowStatusUpdate: (status) => {
      if (!targetUserId) return;
      const cached = manager.getCachedFollow(targetUserId);
      if (cached !== (status as FollowStatus)) {
        manager.setCachedFollow(targetUserId, status as FollowStatus);
        events.handleFollowStatusUpdate(status);
      }
    },
    onUserStatusUpdate: events.handleUserStatusUpdate,
    onError: events.handleProfileLoadError,
  });

  // One-time init per target user with cleanup on unmount
  const initRef = useRef(false);
  const [state, setState] = useState({ initialized: false, loading: false });
  useEffect(() => {
    if (initRef.current || !targetUserId) return;
    initRef.current = true;
    setState({ initialized: false, loading: true });
    (async () => {
      try {
        await manager.initializeProfile(targetUserId);
        setState({ initialized: true, loading: false });
      } catch (e) {
        setState({ initialized: false, loading: false });
      }
    })();
    return () => {
      if (targetUserId) manager.cleanupProfile(targetUserId);
      initRef.current = false;
    };
  }, [targetUserId, manager]);

  // Debounced follow actions (example wiring point)
  const onFollow = useCallback(() => {
    if (!targetUserId) return;
    manager.debounce(
      `follow:${targetUserId}`,
      () => {
        // Delegate to profileScreen hook's follow toggle
        profileScreen.handleFollowToggle();
      },
      500,
    );
  }, [manager, targetUserId, profileScreen]);

  return {
    ...profileScreen,
    ...events,
    ...monitoring,
    integrationState: state,
    onFollow,
    isProfileIntegrated: targetUserId
      ? manager.isProfileIntegrated(targetUserId)
      : false,
  };
}
