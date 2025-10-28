import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { styles } from '@/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { useSSO, useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { startSSOFlow } = useSSO()
    const { isLoaded, isSignedIn } = useAuth()
    const router = useRouter()
    
    // Redirect if already signed in
    useEffect(() => {
        if (!isLoaded) return
        if (isSignedIn) {
            router.replace("/(tabs)")
        }
    }, [isLoaded, isSignedIn, router])

    const handleGoogleSignIn = async () => {
        if (isLoading) {
            return;
        }

        if (isSignedIn) {
            router.replace("/(tabs)")
            return
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const result = await startSSOFlow({ 
                strategy: 'oauth_google'
            });

            if (!result) {
                throw new Error("Authentication was cancelled")
            }

            const { createdSessionId, setActive, signUp } = result

            // Handle new user signup
            if (signUp && signUp.status === "missing_requirements") {
                // Generate username from email if needed
                if (signUp.missingFields.includes("username")) {
                    const email = signUp.emailAddress;
                    const username = email ? email.split("@")[0] : "user" + Date.now();
                    await signUp.update({
                        username: username,
                    });
                }
                
                // Complete the signup
                const signUpResult = await signUp.create({})
                if (signUpResult?.createdSessionId && setActive) {
                    await setActive({ session: signUpResult.createdSessionId })
                } else {
                    throw new Error("Failed to complete signup")
                }
            }
            // Handle existing user login
            else if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
            } 
            // Handle edge case
            else if (setActive) {
                await setActive({ session: null })
            } else {
                throw new Error("Authentication failed - no session created")
            }

            // Small delay to ensure state is updated
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Navigation will be handled by the auth state change
            // Don't force navigation here to avoid conflicts
            
        } catch (error: any) {
            console.error("Login error:", error)
            setError(error.message || "Authentication failed. Please try again.")
            Alert.alert(
                "Login Failed", 
                error.message || "Authentication failed. Please try again.",
                [{ text: "OK" }]
            )
        } finally {
            setIsLoading(false);
        }
    }
  return (
    <View style={styles.container}>

        {/* Brand Section  */}
        <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
                <Image source={require("../../assets/images/icon.png")} style={styles.logoImage} />
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
                {error && (
                    <Text style={[styles.termsText, { color: COLORS.error, marginTop: 10 }]}>
                        {error}
                    </Text>
                )}
                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms and Privacy Policy
                </Text>
            </View>
    </View>
  )
}