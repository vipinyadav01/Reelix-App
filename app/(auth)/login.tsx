import { View, Text, Image, TouchableOpacity, Alert, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSSO, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGoogleSignIn = async () => {
    if (isLoading) {
      return;
    }

    if (isSignedIn) {
      router.replace("/(tabs)");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await startSSOFlow({
        strategy: "oauth_google",
      });

      if (!result) {
        throw new Error("Authentication was cancelled");
      }

      const { createdSessionId, setActive, signUp } = result;

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
        const signUpResult = await signUp.create({});
        if (signUpResult?.createdSessionId && setActive) {
          await setActive({ session: signUpResult.createdSessionId });
        } else {
          throw new Error("Failed to complete signup");
        }
      }
      // Handle existing user login
      else if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
      // Handle edge case
      else if (setActive) {
        await setActive({ session: null });
      } else {
        throw new Error("Authentication failed - no session created");
      }

      // Small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

    } catch (error: any) {
      // Check if user is already signed in
      const errorMessage = error.message || "";
      if (errorMessage.toLowerCase().includes("already signed in") || errorMessage.toLowerCase().includes("current session")) {
        router.replace("/(tabs)");
        return;
      }

      console.error("Login error:", error);
      setError(errorMessage || "Authentication failed. Please try again.");
      Alert.alert(
        "Login Failed",
        errorMessage || "Authentication failed. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View className="flex-1 bg-black">
      {/* Brand Section  */}
      <View className="items-center mt-[15%]">
        <View className="w-24 h-24 rounded-3xl items-center justify-center mb-6">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-[72px] h-[72px]"
          />
        </View>
        <Text className="text-5xl font-bold font-serif italic text-white tracking-wide mb-2">Reelix</Text>
        <Text className="text-sm text-neutral-500 tracking-[2px] uppercase">Share Your Moments</Text>
      </View>

      {/*  Auth Image */}
      <View className="flex-1 justify-center items-center px-8">
        <Image
          source={require("../../assets/images/auth-bg.png")}
          style={{ width: width * 0.7, height: width * 0.7, maxHeight: 260 }}
          resizeMode="cover"
        />
      </View>
      {/*  Auth Form */}
      <View className="w-full px-6 pb-12 items-center">
        <TouchableOpacity
          className={`flex-row items-center justify-center bg-white py-4 px-6 rounded-xl w-full max-w-[320px] mb-4 ${isLoading ? "opacity-70" : ""}`}
          onPress={handleGoogleSignIn}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <View className="w-6 h-6 justify-center items-center mr-3">
            <Ionicons name="logo-google" size={22} color="#000" />
          </View>
          <Text className="text-base font-bold text-black">
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>
        {error && (
          <Text
            className="text-center text-xs text-red-500 max-w-[280px] mt-2 mb-3"
          >
            {error}
          </Text>
        )}
        <Text className="text-center text-xs text-neutral-600 max-w-[300px]">
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </View>
  );
}
