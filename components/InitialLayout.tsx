import { useAuth } from "@clerk/clerk-expo"
import { useRouter, useSegments, Slot } from "expo-router"
import { useEffect, useState } from "react"
import { useUserSync } from "@/hooks/useUserSync"
import { View, Text } from "react-native"
import { COLORS } from "@/constants/theme"
import { Loader } from "@/components/Loader"

export default function InitialLayout() {
    const { isLoaded, isSignedIn } = useAuth()
    const { isLoading: userSyncLoading, syncComplete, timeoutReached } = useUserSync()
    const [navigationReady, setNavigationReady] = useState(false)

    const segments = useSegments()
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            setNavigationReady(true)
        }, 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!isLoaded || !navigationReady) {
            return
        }

        const currentPath = segments.join("/")
        const isAuthScreen = segments[0] === "(auth)"
        const isIndexScreen = currentPath === "" || segments[0] === undefined
        const isTabsScreen = segments[0] === "(tabs)"
        
        if (!isSignedIn && !isAuthScreen) {
            router.replace("/(auth)/login")
            return
        }
        
        if (isSignedIn && (isAuthScreen || isIndexScreen)) {
            router.replace("/(tabs)")
            return
        }

    }, [isLoaded, isSignedIn, segments, navigationReady, router])

    if (!isLoaded || !navigationReady) {
        return <Loader />
    }

    const isOnValidScreen = segments[0] === "(tabs)" || segments[0] === "(auth)"
    if (isSignedIn && userSyncLoading && !isOnValidScreen && !timeoutReached) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <Text style={{ color: COLORS.white, marginBottom: 20 }}>Setting up your account...</Text>
                <Loader />
            </View>
        )
    }

    return <Slot />
}