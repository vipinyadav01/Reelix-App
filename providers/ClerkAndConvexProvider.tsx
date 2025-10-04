import React, { ReactNode } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL as string);

export default function ClerkAndConvexProvider({ children }: { children: ReactNode }) {
  console.log("=== ClerkAndConvexProvider Debug ===");
  console.log("Clerk Key:", process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "Missing");
  console.log("Convex URL:", process.env.EXPO_PUBLIC_CONVEX_URL ? "Set" : "Missing");
  
  if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing!");
  }
  
  if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
    console.error("EXPO_PUBLIC_CONVEX_URL is missing!");
  }

  return (
    <ClerkProvider 
      tokenCache={tokenCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
