import { useAuth } from "@clerk/clerk-expo"
import { Stack, useRouter, useSegments } from "expo-router"
import { useEffect } from "react"
import { useUserSync } from "@/hooks/useUserSync"
import { View, Text } from "react-native"
import { COLORS } from "@/constants/theme"

export default function InitialLayout() {
    const { isLoaded, isSignedIn } = useAuth()
    const { isLoading: userSyncLoading } = useUserSync()

    const segments = useSegments()
    const router = useRouter()

    useEffect(() => {
        if (!isLoaded) return

        const isAuthScreen = segments[0] === "(auth)"
        
        if (!isSignedIn && !isAuthScreen) {
            router.replace("/(auth)/login")
        } else if (isSignedIn && isAuthScreen && !userSyncLoading) {
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

    return <Stack screenOptions={{ headerShown: false }} />
}