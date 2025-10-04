import { useAuth } from "@clerk/clerk-expo"
import { useRouter, useSegments, Slot } from "expo-router"
import { useEffect, useState } from "react"
import { useUserSync } from "@/hooks/useUserSync"
import { View, Text } from "react-native"
import { COLORS } from "@/constants/theme"

export default function InitialLayout() {
    const { isLoaded, isSignedIn } = useAuth()
    const { isLoading: userSyncLoading } = useUserSync()
    const [navigationReady, setNavigationReady] = useState(false)

    const segments = useSegments()
    const router = useRouter()

    console.log("InitialLayout Debug:", {
        isLoaded,
        isSignedIn,
        userSyncLoading,
        segments,
        currentPath: segments.join("/"),
        navigationReady
    })

    // Add a small delay to ensure navigation is ready
    useEffect(() => {
        const timer = setTimeout(() => {
            setNavigationReady(true)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        console.log("InitialLayout useEffect triggered:", {
            isLoaded,
            isSignedIn,
            userSyncLoading,
            segments,
            segmentsLength: segments.length,
            navigationReady
        })

        if (!isLoaded || !navigationReady) {
            console.log("Waiting for clerk to load or navigation to be ready...")
            return
        }

        const currentPath = segments.join("/")
        const isAuthScreen = segments[0] === "(auth)"
        const isTabsScreen = segments[0] === "(tabs)"
        const isIndexScreen = currentPath === "" || segments[0] === undefined
        
        console.log("Navigation logic:", {
            currentPath,
            isAuthScreen,
            isTabsScreen,
            isIndexScreen,
            shouldGoToLogin: !isSignedIn && !isAuthScreen,
            shouldGoToTabs: isSignedIn && (isAuthScreen || isIndexScreen)
        })

        // Only redirect if user is not on the correct screen
        if (!isSignedIn && !isAuthScreen) {
            console.log("User not signed in, redirecting to login...")
            router.replace("/(auth)/login")
        } else if (isSignedIn && isIndexScreen) {
            // Only redirect from index to tabs, don't interfere if already on tabs or auth
            console.log("User signed in, redirecting from index to tabs...")
            router.replace("/(tabs)")
        }

    }, [isLoaded, isSignedIn, segments, userSyncLoading, navigationReady, router])

    if (!isLoaded || !navigationReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: COLORS.white }}>Loading...</Text>
            </View>
        )
    }

    // Only show user sync loading if we're not already on a valid screen
    const isOnValidScreen = segments[0] === "(tabs)" || segments[0] === "(auth)"
    
    if (isSignedIn && userSyncLoading && !isOnValidScreen) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: COLORS.white }}>Syncing user...</Text>
            </View>
        )
    }

    // Render the actual page content using Slot
    return <Slot />
}