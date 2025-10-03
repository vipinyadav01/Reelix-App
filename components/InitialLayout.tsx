import { useAuth } from "@clerk/clerk-expo"
import { useRouter, useSegments } from "expo-router"
import { useEffect } from "react"
import { useUserSync } from "@/hooks/useUserSync"
import { View, Text } from "react-native"
import { COLORS } from "@/constants/theme"

export default function InitialLayout() {
    const { isLoaded, isSignedIn } = useAuth()
    const { isLoading: userSyncLoading } = useUserSync()

    const segments = useSegments()
    const router = useRouter()


    console.log("InitialLayout Debug:", {
        isLoaded,
        isSignedIn,
        userSyncLoading,
        segments,
        currentPath: segments.join("/")
    })

    useEffect(() => {
        console.log("InitialLayout useEffect triggered:", {
            isLoaded,
            isSignedIn,
            userSyncLoading,
            segments,
            segmentsLength: segments.length
        })

        if (!isLoaded) {
            console.log("Clerk not loaded yet, waiting...")
            return
        }

        const isAuthScreen = segments[0] === "(auth)"
        const isTabsScreen = segments[0] === "(tabs)"
        const isIndexScreen = segments[0] === undefined
        
        console.log("Navigation logic:", {
            isAuthScreen,
            isTabsScreen,
            isIndexScreen,
            shouldGoToLogin: !isSignedIn && !isAuthScreen,
            shouldGoToTabs: isSignedIn && (isAuthScreen || isIndexScreen) && !userSyncLoading
        })
        
        
        if (!isSignedIn && !isAuthScreen) {
            console.log("Redirecting to login...")
            router.replace("/(auth)/login")
        } else if (isSignedIn && (isAuthScreen || isIndexScreen) && !userSyncLoading) {
            console.log("Redirecting to tabs...")
            router.replace("/(tabs)")
        }

    }, [isLoaded, isSignedIn, segments, userSyncLoading])

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: COLORS.white }}>Loading...</Text>
            </View>
        )
    }

    if (isSignedIn && userSyncLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: COLORS.white }}>Syncing user...</Text>
            </View>
        )
    }

    // Show loading while navigation is being processed
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
            <Text style={{ color: COLORS.white }}>Loading...</Text>
        </View>
    )
}