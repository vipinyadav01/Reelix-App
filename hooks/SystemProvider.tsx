import React from "react";
import { useSystemInitialization } from "./useSystemInitialization";

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const { error } = useSystemInitialization();

  if (error) {
    console.warn("System initialization error:", error);
    // Don't block the app for system errors, just log them
  }

  // Don't block the app with loading screens - let the authentication flow handle the UI
  // The system initialization happens in the background
  return <>{children}</>;
}
