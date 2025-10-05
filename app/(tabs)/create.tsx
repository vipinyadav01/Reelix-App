import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useState, useRef, useEffect } from 'react';
import { styles } from '@/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as FileSystem from 'expo-file-system/legacy';

// const { width } = Dimensions.get('window');

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isPostedImage, setIsPostedImage] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        aspect: [1, 1],
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setIsPostedImage(false);
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  const handleShare = async () => {
    if (!selectedImage) return;

    try {
      setIsSharing(true);

      // Start progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      const uploadUrl = await generateUploadUrl();
      let storageId: string;
      if (Platform.OS === 'web') {
        const blob = await (await fetch(selectedImage)).blob();
        const resp = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': blob.type || 'image/jpeg' },
          body: blob,
        });
        if (!resp.ok) throw new Error('Upload Failed');
        const json = await resp.json();
        storageId = json.storageId;
      } else {
        const uploadResult = await FileSystem.uploadAsync(
          uploadUrl,
          selectedImage,
          {
            httpMethod: 'POST',
            mimeType: 'image/jpeg',
          }
        );
        if (uploadResult.status !== 200) throw new Error('Upload Failed');
        storageId = JSON.parse(uploadResult.body).storageId;
      }
      await createPost({ storageId: storageId as any, caption });

      Alert.alert(
        'Success!',
        'Your post has been shared successfully!',
        [
          {
            text: 'View in Feed',
            onPress: () => {
              setSelectedImage(null);
              setCaption('');
              setIsPostedImage(false);
              router.push('/(tabs)');
            },
          },
          {
            text: 'Create Another',
            style: 'default',
            onPress: () => {
              setSelectedImage(null);
              setCaption('');
              setIsPostedImage(false);
              // Reset animations
              scaleAnim.setValue(0.8);
              Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
              }).start();
            },
          },
        ]
      );
    } catch (error) {
      console.log('Error Sharing Post:', error);
      Alert.alert('Error', 'Failed to share post. Please try again.');
      progressAnim.setValue(0);
    } finally {
      setIsSharing(false);
    }
  };

  if (!selectedImage) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

        {/* Enhanced Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Enhanced Empty State */}
        <Animated.View
          style={[
            styles.emptyStateContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.emptyImageContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="camera" size={64} color={COLORS.white} />
            </View>
            <Text style={styles.emptyTitle}>Share Your Moment</Text>
            <Text style={styles.emptySubtitle}>
              Select a photo to get started
            </Text>
            <TouchableOpacity
              style={styles.selectImageButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <View style={styles.selectImageGradient}>
                <Ionicons name="image" size={20} color={COLORS.black} />
                <Text style={styles.selectImageText}>Choose Photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.contentContainer}>
        {/* Enhanced Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Discard Post?',
                'Are you sure you want to discard this post?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                      setSelectedImage(null);
                      setCaption('');
                      setIsPostedImage(false);
                    }
                  },
                ]
              );
            }}
            disabled={isSharing}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={28}
              color={isSharing ? COLORS.gray : COLORS.white}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>New Post</Text>

          <TouchableOpacity
            style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
            disabled={isSharing || !selectedImage}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            {isSharing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.white} />
              </View>
            ) : (
              <View style={styles.shareGradient}>
                <Text style={styles.shareText}>Share</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Bar */}
        {isSharing && (
          <Animated.View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              isSharing && styles.contentDisabled,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Enhanced Image Section */}
            <View style={styles.imageSection}>
              <Animated.View
                style={[
                  styles.imageContainer,
                  { transform: [{ scale: scaleAnim }] }
                ]}
              >
                <Image
                  source={selectedImage}
                  style={styles.previewImage}
                  contentFit="cover"
                  transition={300}
                />

                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={pickImage}
                    disabled={isSharing}
                    activeOpacity={0.8}
                  >
                    <View style={styles.changeImageButtonInner}>
                      <Ionicons name="camera" size={18} color={COLORS.white} />
                      <Text style={styles.changeImageText}>Change</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>

            {/* Enhanced Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.captionContainer}>
                <View style={styles.userInfo}>
                  <Image
                    source={{ uri: user?.imageUrl }}
                    style={styles.userAvatar}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.username}>{user?.username || user?.firstName}</Text>
                    <Text style={styles.userHandle}>@{user?.username || 'user'}</Text>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Write a caption... (optional)"
                    placeholderTextColor={COLORS.gray}
                    multiline
                    value={caption}
                    onChangeText={setCaption}
                    editable={!isSharing}
                    maxLength={2200}
                  />
                  <Text style={styles.characterCount}>
                    {caption.length}/2200
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
