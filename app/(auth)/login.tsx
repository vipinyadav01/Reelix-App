import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { styles } from '@/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { useSSO, useAuth } from '@clerk/clerk-expo'
import { useRouter, useSegments } from 'expo-router'

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const { startSSOFlow } = useSSO()
    const { isSignedIn } = useAuth()
    const router = useRouter()
    const segments = useSegments()
    const loginAttemptRef = useRef(false)

    // Handle navigation when auth state changes
    useEffect(() => {
        if (isSignedIn) {
            console.log("Login component: User is signed in, navigating to tabs");
            router.replace("/(tabs)");
        }
    }, [isSignedIn, router]);

    const handleGoogleSignIn = async () => {
        if (isLoading || loginAttemptRef.current) {
            return;
        }

        // Check if user is already signed in
        if (isSignedIn) {
            console.log("User already signed in, redirecting to tabs");
            router.replace("/(tabs)");
            return;
        }

        try {
            setIsLoading(true);
            loginAttemptRef.current = true;
            
            console.log("Starting Google OAuth flow...");
            
            const result = await startSSOFlow({ 
                strategy: 'oauth_google'
            });

            console.log("OAuth flow completed:", result);

            // Handle different response formats
            const { createdSessionId, setActive, signUp, signIn: signInResult } = result || {};

            // Check if we have a sign-up that needs completion
            if (signUp && signUp.status === "missing_requirements") {
                console.log("Sign-up needs completion, missing fields:", signUp.missingFields);
                
                // Complete the sign-up with required fields
                if (signUp.missingFields.includes("username")) {
                    const email = signUp.emailAddress;
                    const username = email ? email.split("@")[0] : "user" + Date.now();
                    
                    console.log("Completing sign-up with username:", username);
                    
                    await signUp.update({
                        username: username,
                    });
                    
                    console.log("Sign-up updated with username");
                }
                
                // Create the user and get the session
                const signUpResult = await signUp.create({});
                console.log("Sign-up creation result:", signUpResult);
                
                // If we got a session from sign-up, use it
                if (signUpResult?.createdSessionId && setActive) {
                    console.log("Setting active session from sign-up:", signUpResult.createdSessionId);
                    await setActive({ session: signUpResult.createdSessionId });
                    console.log("Session set from sign-up successfully");
                }
            }

            // Set the active session if available (only if we haven't already set it from sign-up)
            if (createdSessionId && setActive && !signUp) {
                console.log("Setting active session with ID:", createdSessionId);
                await setActive({ session: createdSessionId });
                console.log("Session set successfully");
            } else if (setActive && !signUp) {
                console.log("No session ID returned, but setActive is available");
                // Try to set active without session ID
                await setActive({ session: null });
                console.log("Set active called without session ID");
            } else if (!signUp) {
                console.error("OAuth flow failed - no session created and no setActive function");
                throw new Error("OAuth authentication failed");
            }

            // Wait a moment for the auth state to update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if we're now signed in
            console.log("Checking auth state after OAuth:", { isSignedIn });
            
            // If we're signed in, navigate to tabs
            if (isSignedIn) {
                console.log("User is now signed in, navigating to tabs");
                router.replace("/(tabs)");
            }
            
        } catch (error) {
            console.error("OAuth error:", error);
            
            // Handle specific error cases
            if (error instanceof Error) {
                if (error.message?.includes("Another web browser is already open")) {
                    // Browser conflict - user should close open browsers and retry
                    console.log("Please close any open browsers and try again");
                } else if (error.message?.includes("User cancelled")) {
                    // User cancelled the OAuth flow
                    console.log("Login cancelled by user");
                }
            }
        } finally {
            setIsLoading(false);
            loginAttemptRef.current = false;
        }
    }
  return (
    <View style={styles.container}>

        {/* Brand Section  */}
        <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
                <Ionicons name="logo-web-component" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>reelix</Text>
            <Text style={styles.tagline}>Don&apos;t miss anything</Text>
            </View>

            {/*  Auth Image */}
            <View style={styles.illustrationContainer}>
            <Image source={require("../../assets/images/auth-bg.png")}
            style={styles.illustration}
            resizeMode="cover" />
            </View>
            {/*  Auth Form */}
            <View style={styles.loginSection}>
                <TouchableOpacity
                 style={[styles.googleButton, isLoading && { opacity: 0.7 }]}
                 onPress={handleGoogleSignIn}
                 activeOpacity={0.7}
                 disabled={isLoading}
                >
                <View style={styles.googleIconContainer}>
                    <Ionicons name="logo-google" size={20} color={COLORS.surface} />
                    </View>
                    <Text style={styles.googleButtonText}>
                        {isLoading ? "Signing in..." : "Continue with Google"}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms and Privacy Policy
                </Text>
            </View>
    </View>
  )
}