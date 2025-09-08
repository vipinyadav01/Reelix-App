import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { SystemManager } from './SystemManager';

export function useSystemInitialization() {
  const { user } = useUser();
  const userId = user?.id;
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializationRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const systemManager = useMemo(() => SystemManager.getInstance(), []);

  useEffect(() => {
    if (!userId) {
      setIsReady(false);
      setIsLoading(false);
      return;
    }

    if (initializationRef.current && userIdRef.current === userId) {
      return;
    }

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
      setError(null);
      try {
        await systemManager.initialize(userId);
        setIsReady(true);
      } catch (e: any) {
        setError(e?.message || 'Initialization failed');
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


