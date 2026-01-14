import { View, Text, Image } from "react-native";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  content: string;
  _creationTime: number;
  user: {
    fullname: string;
    image: string;
  };
}

export default function CommentItem({ comment }: { comment: Comment }) {
  return (
    <View className="flex-row items-start py-3 border-b border-neutral-800">
      <Image
        source={{ uri: comment.user.image }}
        className="w-8 h-8 rounded-full mr-3 bg-neutral-700"
      />
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm mb-1">{comment.user.fullname}</Text>
        <Text className="text-white text-sm leading-5">{comment.content}</Text>
        <Text className="text-neutral-500 text-xs mt-1">
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
