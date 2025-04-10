import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo';
import { useState } from 'react';
import { styles } from '@/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 0.8,
      allowsEditing: true,
    });
    
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  }

  console.log("selectedImage", selectedImage);

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <TouchableOpacity 
          style={styles.emptyImageContainer} 
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={48} color={COLORS.gray} />
          <Text style={styles.emptyImageText}>Add Image</Text>
        </TouchableOpacity>
      </View>
    )
  }
  
  return (
    <View>
      <Text>create</Text>
    </View>
  )
}