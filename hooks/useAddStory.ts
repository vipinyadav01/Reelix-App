import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Platform } from "react-native";
import { useMutation } from "convex/react";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";

export function useAddStory() {
  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.createStory);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  async function pickAndUpload(source: "gallery" | "camera") {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== "granted") return;
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images", "videos"] as any,
        allowsEditing: true,
        quality: 0.9,
      });
      if (res.canceled) return;
      const asset = res.assets[0];
      await openEditor(asset);
      return;
    }
    const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libPerm.status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"] as any,
      allowsEditing: true,
      quality: 0.9,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    await openEditor(asset);
  }

  async function uploadAsset(
    asset: ImagePicker.ImagePickerAsset,
    privacy: "public" | "close_friends" = "public",
  ) {
    setIsUploading(true);
    try {
      const mediaType = asset.type === "video" ? "video" : "image";
      const uploadUrl = await generateUploadUrl();
      let storageId: string;
      if (Platform.OS === "web") {
        const blob = await (await fetch(asset.uri)).blob();
        const resp = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type":
              blob.type || (mediaType === "video" ? "video/mp4" : "image/jpeg"),
          },
          body: blob,
        });
        const json = await resp.json();
        storageId = json.storageId;
      } else {
        const uploadRes = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
          httpMethod: "POST",
        });
        storageId = JSON.parse(uploadRes.body).storageId;
      }
      await createStory({
        storageId: storageId as any,
        mediaType,
        caption: "",
        privacy,
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function openEditor(asset: ImagePicker.ImagePickerAsset) {
    const type = asset.type === "video" ? "video" : "image";
    router.push({
      pathname: "/story/edit",
      params: { uri: asset.uri, type },
    } as any);
  }

  const addStory = useCallback(
    async (opts?: { source?: "gallery" | "camera" }) => {
      if (opts?.source) {
        await pickAndUpload(opts.source);
        return;
      }
      Alert.alert("Add Story", "Choose source", [
        { text: "Camera", onPress: () => pickAndUpload("camera") },
        { text: "Gallery", onPress: () => pickAndUpload("gallery") },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [],
  );

  return { addStory, isUploading };
}
