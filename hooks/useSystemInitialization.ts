import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { SystemManager } from './SystemManager';

export function useSystemInitialization() {
  const { user } = useUser();
  const userId = user?.id;
  const [isReady, setIsReady] = useState(true); // Start as ready to allow app to load
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializationRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const systemManager = useMemo(() => SystemManager.getInstance(), []);

  useEffect(() => {
    // If no user, system is ready (allows login flow to work)
    if (!userId) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    // If already initialized for this user, we're ready
    if (initializationRef.current && userIdRef.current === userId) {
      setIsReady(true);
      return;
    }

    // If system is already ready for this user
    if (systemManager.isSystemReady() && systemManager.getCurrentUserId() === userId) {
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    const run = async () => {
      if (initializationRef.current && userIdRef.current === userId) return;
      initializationRef.current = true;
      userIdRef.current = userId;
      setIsLoading(true);
      setIsReady(false); // Only set to false when actually initializing
      setError(null);
      try {
        await systemManager.initialize(userId);
        setIsReady(true);
      } catch (e: any) {
        setError(e?.message || 'Initialization failed');
        setIsReady(true); // Still allow app to work even if system init fails
        initializationRef.current = false;
        userIdRef.current = null;
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [userId, systemManager]);

  useEffect(() => {
    return () => {
      systemManager.cleanup();
    };
  }, [systemManager]);

  return {
    isReady,
    isLoading,
    error,
    systemManager,
  };
}


