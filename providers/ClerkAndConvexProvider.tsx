import React, { ReactNode } from 'react';
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);

export default function ClerkAndConvexProvider({ children }: { children: ReactNode }) {
  console.log("ClerkAndConvexProvider - Environment check:", {
    clerkKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "Missing",
    convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL ? "Set" : "Missing"
  });

  return (
    <ClerkProvider 
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ClerkLoaded>
          {children}
        </ClerkLoaded>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
