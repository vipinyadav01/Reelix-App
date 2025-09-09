import { useEffect, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface SystemMonitoringOptions {
  currentUserId?: string;
  targetUserId?: string;
  onFollowStatusUpdate?: (status: string) => void;
  onUserStatusUpdate?: (userId: string, status: string) => void;
  onError?: (error: string) => void;
}

export function useSystemMonitoring({
  currentUserId,
  targetUserId,
  onFollowStatusUpdate,
  onUserStatusUpdate,
  onError,
}: SystemMonitoringOptions) {
  
  // Monitor user data changes
  const currentUser = useQuery(
    api.user.getUserByClerkId,
    currentUserId ? { clerkId: currentUserId } : "skip"
  );

  const targetUser = useQuery(
    api.user.getUserByClerkId,
    targetUserId ? { clerkId: targetUserId } : "skip"
  );

  // Monitor follow status changes
  const followStatus = useQuery(
    api.user.getRelationshipData,
    targetUser && targetUser._id ? { targetId: targetUser._id } : "skip"
  );

  // Handle follow status updates
  const lastFollowStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!followStatus || !onFollowStatusUpdate) return;
    const next = String(followStatus.followStatus) as string | undefined;
    if (next && lastFollowStatusRef.current !== next) {
      lastFollowStatusRef.current = next;
      onFollowStatusUpdate(next);
    }
  }, [followStatus, onFollowStatusUpdate]);

  // Handle user status updates
  const lastCurrentUserIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!currentUser || !onUserStatusUpdate) return;
    const id = currentUser._id as string | undefined;
    if (id && lastCurrentUserIdRef.current !== id) {
      lastCurrentUserIdRef.current = id;
      onUserStatusUpdate(id, 'online');
    }
  }, [currentUser, onUserStatusUpdate]);

  const lastTargetUserIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!targetUser || !onUserStatusUpdate) return;
    const id = targetUser._id as string | undefined;
    if (id && lastTargetUserIdRef.current !== id) {
      lastTargetUserIdRef.current = id;
      onUserStatusUpdate(id, 'online');
    }
  }, [targetUser, onUserStatusUpdate]);

  // Error handling
  const handleError = useCallback((error: string) => {
    console.error('System monitoring error:', error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    console.log('System monitoring started');
    // Additional monitoring logic can be added here
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    console.log('System monitoring stopped');
    // Cleanup logic can be added here
  }, []);

  return {
    followStatus,
    currentUser,
    targetUser,
    handleError,
    startMonitoring,
    stopMonitoring,
  };
}
