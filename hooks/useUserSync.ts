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
    user ? { clerkId: user.id } : "skip",
  );

  // Timeout mechanism to prevent infinite loading
  useEffect(() => {
    if (!user || !isLoaded) return;

    const timeout = setTimeout(() => {
      console.log("User sync timeout reached - allowing navigation to proceed");
      setTimeoutReached(true);
      setSyncComplete(true);
    }, 8000); // Reduced to 8 seconds for better UX

    return () => clearTimeout(timeout);
  }, [user, isLoaded]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user || isSyncing || syncComplete || timeoutReached) {
        return;
      }

      // If user exists in Convex, mark sync as complete
      if (existingUser) {
        setSyncComplete(true);
        return;
      }

      // If query is still loading, wait
      if (existingUser === undefined) {
        return;
      }

      // User doesn't exist, create them
      setIsSyncing(true);
      try {
        const userData = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          fullname: user.fullName || "",
          username:
            user.username ||
            user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
            "",
          image: user.imageUrl || "",
          bio: "",
        };

        console.log("Creating user in Convex:", userData);
        const createdUser = await createUser(userData);
        console.log("User created successfully:", createdUser);

        // Only mark as complete if user was actually created
        if (createdUser) {
          setSyncComplete(true);
        } else {
          console.error("User creation returned null/undefined");
        }
      } catch (error) {
        console.error("Error syncing user to Convex:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [
    isLoaded,
    user,
    existingUser,
    createUser,
    isSyncing,
    syncComplete,
    timeoutReached,
  ]);

  // Don't wait for user sync if not signed in
  if (!isLoaded)
    return {
      user: null,
      isLoading: true,
      syncComplete: false,
      isSyncing: false,
      timeoutReached: false,
    };
  if (!user)
    return {
      user: null,
      isLoading: false,
      syncComplete: true,
      isSyncing: false,
      timeoutReached: false,
    };

  return {
    user: existingUser,
    isLoading:
      !syncComplete &&
      !timeoutReached &&
      (existingUser === undefined || isSyncing),
    syncComplete,
    isSyncing,
    timeoutReached,
  };
}
