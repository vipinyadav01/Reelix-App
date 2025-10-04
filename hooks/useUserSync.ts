import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  const createUser = useMutation(api.user.createUser);
  const existingUser = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (!user || !isLoaded) return;
    
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setSyncComplete(true);
      console.log("User sync timeout reached");
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [user, isLoaded]);

  useEffect(() => {
    const syncUser = async () => {
      console.log("=== User Sync Debug ===");
      console.log("isLoaded:", isLoaded);
      console.log("user:", user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress } : null);
      console.log("isSyncing:", isSyncing);
      console.log("syncComplete:", syncComplete);
      console.log("timeoutReached:", timeoutReached);
      console.log("existingUser:", existingUser);
      
      if (!isLoaded || !user || isSyncing || syncComplete || timeoutReached) {
        console.log("Skipping user sync - conditions not met");
        return;
      }

      // If user exists in Convex, mark sync as complete
      if (existingUser) {
        console.log("User already exists in Convex:", existingUser);
        setSyncComplete(true);
        return;
      }

      // If query is still loading, wait
      if (existingUser === undefined) {
        console.log("Still loading existing user query...");
        return;
      }

      // User doesn't exist, create them
      console.log("Creating new user in Convex...");
      setIsSyncing(true);
      try {
        const userData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          fullname: user.fullName || "",
          username: user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || "",
          image: user.imageUrl || "",
          bio: "",
        };
        console.log("User data to create:", userData);
        
        const result = await createUser(userData);
        console.log("User created successfully:", result);
        setSyncComplete(true);
      } catch (error) {
        console.error("Error syncing user to Convex:", error);
        // Even if sync fails, mark as complete to avoid infinite loading
        setSyncComplete(true);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, user, existingUser, createUser, isSyncing, syncComplete, timeoutReached]);

  // Don't wait for user sync if not signed in
  if (!isLoaded) return { user: null, isLoading: true };
  if (!user) return { user: null, isLoading: false };

  return { 
    user: existingUser, 
    isLoading: !syncComplete && !timeoutReached && (existingUser === undefined || isSyncing) 
  };
}
