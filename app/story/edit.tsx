import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as FileSystem from "expo-file-system/legacy";

export default function EditStory() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri: string; type: string }>();
  const [submitting, setSubmitting] = useState(false);
  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.createStory);

  const uri = params.uri as string | undefined;
  const type = (params.type as string) === "video" ? "video" : "image";

  const upload = async (privacy: "public" | "close_friends") => {
    if (!uri) return;
    if (privacy === "close_friends") {
      alert("Coming soon: Close friends sharing");
      return;
    }
    setSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await FileSystem.uploadAsync(uploadUrl, uri, {
        httpMethod: "POST",
      });
      const storageId = JSON.parse(uploadRes.body).storageId;
      await createStory({
        storageId: storageId as any,
        mediaType: type,
        caption: "",
        privacy,
      });
      router.replace("/(tabs)");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 p-4 gap-4">
      <View className="flex-1 items-center justify-center">
        {uri && type === "image" && (
          <Image source={{ uri }} className="w-full h-full" resizeMode="contain" />
        )}
        {uri && type === "video" && (
          <Text className="text-white">Video selected</Text>
        )}
      </View>
      <View className="flex-row gap-3 pb-6">
        <TouchableOpacity
          className="flex-1 p-3.5 rounded-xl items-center bg-[#4ade80]"
          disabled={submitting}
          onPress={() => upload("public")}
        >
          <Text className="text-white font-bold">Share Public</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 p-3.5 rounded-xl items-center bg-[#374151]"
          disabled={submitting}
          onPress={() => upload("close_friends")}
        >
          <Text className="text-white font-bold">Close Friends (Soon)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
