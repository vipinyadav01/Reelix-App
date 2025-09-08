export class SystemManager {
  private static instance: SystemManager;
  private isInitialized = false;
  private currentUserId: string | null = null;
  private initializationPromise: Promise<void> | null = null;
  private cleanupFunctions: Array<() => void> = [];

  static getInstance(): SystemManager {
    if (!SystemManager.instance) {
      SystemManager.instance = new SystemManager();
    }
    return SystemManager.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.currentUserId === userId) {
      return;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.performInitialization(userId);
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async performInitialization(userId: string): Promise<void> {
    if (this.currentUserId && this.currentUserId !== userId) {
      this.cleanup();
    }

    this.currentUserId = userId;

    try {
      await this.initializeFeedClickSystem();
      await this.initializeProfileNavigation();
      await this.initializeFollowSystem();
      await this.initializeRealtimeUpdates();
      this.registerEventHandlers();
      this.isInitialized = true;
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private async initializeFeedClickSystem(): Promise<void> {
    const cleanup = () => {};
    this.cleanupFunctions.push(cleanup);
  }

  private async initializeProfileNavigation(): Promise<void> {
    const cleanup = () => {};
    this.cleanupFunctions.push(cleanup);
  }

  private async initializeFollowSystem(): Promise<void> {
    const cleanup = () => {};
    this.cleanupFunctions.push(cleanup);
  }

  private async initializeRealtimeUpdates(): Promise<void> {
    const cleanup = () => {};
    this.cleanupFunctions.push(cleanup);
  }

  private registerEventHandlers(): void {
    // no-op; handlers should be registered once
  }

  cleanup(): void {
    if (!this.isInitialized) return;
    for (const fn of this.cleanupFunctions) {
      try { fn(); } catch {}
    }
    this.cleanupFunctions = [];
    this.isInitialized = false;
    this.currentUserId = null;
    this.initializationPromise = null;
  }

  isSystemReady(): boolean {
    return this.isInitialized && this.currentUserId !== null;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}


