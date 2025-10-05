import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { styles } from '@/styles/auth.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants/theme'
import { useSSO, useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const { startSSOFlow } = useSSO()
    const { isLoaded, isSignedIn } = useAuth()
    const router = useRouter()
    
    const loginAttemptRef = useRef(false)
    useEffect(() => {
        if (!isLoaded) return
        if (isSignedIn) {
            router.replace("/(tabs)")
        }
    }, [isLoaded, isSignedIn, router])

    const handleGoogleSignIn = async () => {
        if (isLoading || loginAttemptRef.current) {
            return;
        }

        if (isSignedIn) {
            router.replace("/(tabs)")
            return
        }

        try {
            setIsLoading(true);
            loginAttemptRef.current = true;
            
            const result = await startSSOFlow({ 
                strategy: 'oauth_google'
            });

            const { createdSessionId, setActive, signUp } = result || {}

            if (signUp && signUp.status === "missing_requirements") {
                if (signUp.missingFields.includes("username")) {
                    const email = signUp.emailAddress;
                    const username = email ? email.split("@")[0] : "user" + Date.now();
                    await signUp.update({
                        username: username,
                    });
                }
                
                const signUpResult = await signUp.create({})
                if (signUpResult?.createdSessionId && setActive) {
                    await setActive({ session: signUpResult.createdSessionId })
                }
            }

            if (createdSessionId && setActive && !signUp) {
                await setActive({ session: createdSessionId })
            } else if (setActive && !signUp) {
                await setActive({ session: null })
            } else if (!signUp) {
                throw new Error("OAuth authentication failed")
            }

            await new Promise(resolve => setTimeout(resolve, 800))
            router.replace("/(tabs)")
            
        } catch {
            
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
                <Text style={styles.termsText}>
                    By continuing, you agree to our Terms and Privacy Policy
                </Text>
            </View>
    </View>
  )
}