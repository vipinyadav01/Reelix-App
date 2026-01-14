import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { Loader } from "./Loader";
import CommentItem from "./Comment";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CommentsModal = {
  postId: Id<"posts">;
  visible: boolean;
  onClose: () => void;
};

export default function CommentsModal({
  onClose,
  postId,
  visible,
}: CommentsModal) {
  const [newComment, setNewComment] = useState("");
  const comments = useQuery(api.comments.getComments, { postId });
  const addComment = useMutation(api.comments.addComment);
  const insets = useSafeAreaInsets();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        content: newComment,
        postId,
      });

      setNewComment("");
    } catch (error) {
      console.log("Error adding comment:", error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={onClose}>
            <View className="flex-1 bg-black/60 justify-end">
                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        className="h-[80%] bg-[#121212] rounded-t-[24px] overflow-hidden w-full"
                    >
                        {/* Drag Handle */}
                        <View className="w-full items-center pt-3 pb-2 bg-[#121212]">
                            <View className="w-10 h-1 bg-neutral-700 rounded-full" />
                        </View>

                        {/* Header */}
                        <View className="flex-row justify-center items-center px-4 pb-3 border-b border-neutral-800 relative bg-[#121212]">
                            <Text className="text-white text-base font-bold">Comments</Text>
                            <TouchableOpacity 
                                onPress={onClose}
                                className="absolute right-4 top-0"
                            >
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        {comments === undefined ? (
                            <View className="flex-1 justify-center">
                                <Loader />
                            </View>
                        ) : comments.length === 0 ? (
                            <View className="flex-1 justify-center items-center">
                                <Ionicons name="chatbubble-outline" size={48} color={COLORS.gray} />
                                <Text className="text-neutral-500 mt-4 text-base">No comments yet</Text>
                                <Text className="text-neutral-600 text-sm mt-1">Be the first to comment.</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={comments}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => <CommentItem comment={item} />}
                                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                                showsVerticalScrollIndicator={false}
                            />
                        )}

                        {/* Input Area */}
                        <View 
                            className="flex-row items-center px-4 py-3 border-t border-neutral-800 bg-[#121212]"
                            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
                        >
                            <View className="flex-1 flex-row items-center bg-neutral-800 rounded-full px-4 py-2 mr-3 border border-neutral-700">
                                <TextInput
                                    className="flex-1 text-white text-sm max-h-20"
                                    placeholder="Add a comment..."
                                    placeholderTextColor="#888"
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    multiline
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleAddComment}
                                disabled={!newComment.trim()}
                                className={`p-2 rounded-full ${newComment.trim() ? "bg-blue-600" : "bg-neutral-800"}`}
                            >
                                <Ionicons 
                                    name="arrow-up" 
                                    size={20} 
                                    color={newComment.trim() ? "white" : "gray"} 
                                />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
}
