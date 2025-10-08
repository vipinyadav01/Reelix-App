import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Loader } from "@/components/Loader";
import { View, Text } from "react-native";
import { COLORS } from "@/constants/theme";

export default function SSOCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("SSO callback params:", params);
    
    const handleCallback = async () => {
      try {
        const sessionId = params.created_session_id || params.session_id;
        
        if (sessionId) {
          console.log("Session created with ID:", sessionId);
          await new Promise(resolve => setTimeout(resolve, 1500));
          router.replace("/(tabs)");
        } else {
          console.log("No session ID found, redirecting to login");
          setTimeout(() => {
            router.replace("/(auth)/login");
          }, 1000);
        }
        
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        setError(error.message || "Authentication failed");

        setTimeout(() => {
          router.replace("/(auth)/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [router, params]);

  if (error) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#000',
        padding: 20 
      }}>
        <Text style={{ color: COLORS.error, textAlign: 'center', marginBottom: 20 }}>
          Authentication Error
        </Text>
        <Text style={{ color: COLORS.white, textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 10 }}>
          Redirecting to login...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#000' 
    }}>
      <Text style={{ color: COLORS.white, marginBottom: 20 }}>
        Completing sign in...
      </Text>
      <Loader />
    </View>
  );
}