import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useAddStory() {
  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.createStory);

  return async function addStory() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.9,
    });
    if (res.canceled) return;

    const asset = res.assets[0];
    const mediaType = asset.type === 'video' ? 'video' : 'image';

    const uploadUrl = await generateUploadUrl();
    let storageId: string;

    if (Platform.OS === 'web') {
      const blob = await (await fetch(asset.uri)).blob();
      const resp = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': blob.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg') },
        body: blob,
      });
      const json = await resp.json();
      storageId = json.storageId;
    } else {
      const uploadRes = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
        httpMethod: 'POST',
      });
      storageId = JSON.parse(uploadRes.body).storageId;
    }

    await createStory({
      storageId: storageId as any,
      mediaType,
      caption: '',
    });
  };
}


