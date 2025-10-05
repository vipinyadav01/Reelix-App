import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as FileSystem from 'expo-file-system/legacy';

export default function EditStory() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri: string; type: string }>();
  const [submitting, setSubmitting] = useState(false);
  const generateUploadUrl = useMutation(api.stories.generateUploadUrl);
  const createStory = useMutation(api.stories.createStory);

  const uri = params.uri as string | undefined;
  const type = (params.type as string) === 'video' ? 'video' : 'image';

  const upload = async (privacy: 'public' | 'close_friends') => {
    if (!uri) return;
    if (privacy === 'close_friends') {
      alert('Coming soon: Close friends sharing');
      return;
    }
    setSubmitting(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await FileSystem.uploadAsync(uploadUrl, uri, { httpMethod: 'POST' });
      const storageId = JSON.parse(uploadRes.body).storageId;
      await createStory({ storageId: storageId as any, mediaType: type, caption: '', privacy });
      router.replace('/(tabs)');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {uri && type === 'image' && (
          <Image source={{ uri }} style={styles.media} />
        )}
        {uri && type === 'video' && (
          <Text style={styles.videoText}>Video selected</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.primary]} disabled={submitting} onPress={() => upload('public')}>
          <Text style={styles.btnText}>Share Public</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.secondary]} disabled={submitting} onPress={() => upload('close_friends')}>
          <Text style={styles.btnText}>Close Friends (Soon)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  media: { width: '100%', height: '100%', resizeMode: 'contain' },
  videoText: { color: '#fff' },
  actions: { flexDirection: 'row', gap: 12, paddingBottom: 24 },
  btn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#4ade80' },
  secondary: { backgroundColor: '#374151' },
  btnText: { color: '#fff', fontWeight: '700' },
});


