import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "@/components/ScreenHeader";

const DUMMY_CHATS = [
  {
    id: "1",
    username: "alex_doe",
    image: "https://ui-avatars.com/api/?name=Alex+Doe&background=random",
    lastMessage: "See you tomorrow! 👋",
    time: "2m",
    unread: 2,
  },
  {
    id: "2",
    username: "sarah_smith",
    image: "https://ui-avatars.com/api/?name=Sarah+Smith&background=random",
    lastMessage: "That was awesome!",
    time: "1h",
    unread: 0,
  },
  {
    id: "3",
    username: "mike_j",
    image: "https://ui-avatars.com/api/?name=Mike+J&background=random",
    lastMessage: "Can you send me the link?",
    time: "3h",
    unread: 0,
  },
];

export default function InboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title={<Text className="text-3xl font-bold font-serif italic text-white">Messages</Text>}
        rightElement={
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        className="flex-1"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center mb-5 active:opacity-70"
            onPress={() => router.push(`/chat/${item.id}` as any)} // Using ID as userId for demo
          >
            <View className="relative">
               <Image
                 source={{ uri: item.image }}
                 className="w-14 h-14 rounded-full bg-neutral-800"
               />
               {item.unread > 0 && (
                   <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
               )}
            </View>
            
            <View className="flex-1 ml-3.5 justify-center">
               <View className="flex-row justify-between items-center mb-1">
                   <Text className="text-white font-semibold text-base">{item.username}</Text>
                   <Text className="text-neutral-500 text-xs">{item.time}</Text>
               </View>
               <Text 
                  className={`text-[14px] leading-5 ${item.unread > 0 ? "text-white font-semibold" : "text-neutral-400"}`}
                  numberOfLines={1}
               >
                 {item.lastMessage}
               </Text>
            </View>

            {item.unread > 0 && (
                <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center ml-2">
                    <Text className="text-white text-[10px] font-bold">{item.unread}</Text>
                </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
