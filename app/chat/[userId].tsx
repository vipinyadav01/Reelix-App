import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { theme } from "@/constants/theme";

// --- Types for Demo Data ---
interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: Date;
}

export default function ChatScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // --- Fetch Target User Info (Real) ---
  // Only query if userId looks like a valid Convex ID (starts with specific pattern)
  const isValidConvexId = userId && userId.length > 10 && userId.includes('|');
  const targetUser = useQuery(
    api.user.getUserProfile,
    isValidConvexId ? { id: userId as Id<"users"> } : "skip"
  );

  // --- Demo Messages State ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hey! Loved your recent post! 🔥",
      sender: "them",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    },
    {
      id: "2",
      text: "Thanks! I appreciate it.",
      sender: "me",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      id: "3",
      text: "Are you planning to release more content like that?",
      sender: "them",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    },
  ]);
  const [inputText, setInputText] = useState("");

  // Scroll to bottom on new message
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "me",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Mimic reply
    setTimeout(() => {
        setMessages((prev) => [
            ...prev,
            {
                id: (Date.now() + 1).toString(),
                text: "That sounds awesome! Can't wait.",
                sender: "them",
                timestamp: new Date(),
            }
        ])
    }, 2000);
  };

  // Use demo data for invalid IDs (from inbox dummy data)
  const getDemoUsername = (id: string) => {
    const demoUsers: Record<string, string> = {
      "1": "alex_doe",
      "2": "sarah_smith",
      "3": "mike_j"
    };
    return demoUsers[id] || "User";
  };

  const username = targetUser?.username || getDemoUsername(userId || "");
  const avatarUrl = targetUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

  if (!userId) return null;

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* --- Header --- */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-neutral-900 border-b border-neutral-800 pb-3"
      >
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
            <View className="relative">
                <Image
                source={{ uri: avatarUrl }}
                className="w-9 h-9 rounded-full bg-neutral-700"
                />
                {/* Online Indicator (Demo) */}
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-900" />
            </View>
            <View className="ml-3">
              <Text className="text-white font-bold text-base">{username}</Text>
              <Text className="text-neutral-400 text-xs">Active now</Text>
            </View>
          </View>

          <TouchableOpacity>
            <Ionicons name="information-circle-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- Mesage List --- */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        className="flex-1"
        renderItem={({ item }) => {
          const isMe = item.sender === "me";
          return (
            <View
              className={`flex-row mb-4 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-7 h-7 rounded-full mr-2 self-end mb-1"
                />
              )}
              <View
                className={`px-4 py-2.5 max-w-[75%] rounded-2xl ${
                  isMe
                    ? "bg-blue-600 rounded-br-sm"
                    : "bg-neutral-800 rounded-bl-sm"
                }`}
              >
                <Text className="text-white text-[15px] leading-5">
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* --- Input Area --- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View
          style={{ paddingBottom: insets.bottom + 10 }}
          className="px-3 pt-3 bg-black border-t border-neutral-800 flex-row items-center"
        >
          <TouchableOpacity className="p-2 bg-neutral-900 rounded-full mr-2">
            <Ionicons name="camera" size={22} color="#3b82f6" />
          </TouchableOpacity>

          <View className="flex-1 bg-neutral-900 flex-row items-center rounded-full px-4 py-2 mr-2 border border-neutral-800 h-[44px]">
            <TextInput
              className="flex-1 text-white text-base max-h-20"
              placeholder="Message..."
              placeholderTextColor="#666"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
            {inputText.length === 0 && (
                 <TouchableOpacity>
                     <Ionicons name="image-outline" size={24} color="#666" />
                 </TouchableOpacity>
            )}
          </View>

          {inputText.length > 0 ? (
            <TouchableOpacity onPress={handleSend}>
              <Text className="text-blue-500 font-bold text-base mr-2">Send</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="p-2" onPress={() => console.log('Mic')}>
               <Ionicons name="mic-outline" size={26} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
