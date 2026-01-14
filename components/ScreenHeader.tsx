import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";

interface ScreenHeaderProps {
  title: string | React.ReactNode;
  rightElement?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  backIconName?: keyof typeof Ionicons.glyphMap;
  className?: string; // Allow override if absolutely needed
}

/**
 * A standardized header component for all screens.
 * Uses consistent padding and alignment.
 * Relies on the parent SafeAreaView for top padding (status bar avoidance).
 */
export const ScreenHeader = ({
  title,
  rightElement,
  showBackButton = false,
  onBackPress,
  backIconName = "arrow-back",
  className = "",
}: ScreenHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`flex-row justify-between items-center px-4 py-2 border-b border-neutral-800 bg-black h-[54px] ${className}`}
    >
      <View className="flex-row items-center flex-1">
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBack}
            className="mr-3 p-1 -ml-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={backIconName} size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        
        {typeof title === "string" ? (
          <Text className="text-xl font-bold text-white font-serif italic truncate" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
      </View>

      <View className="flex-row items-center gap-4">
        {rightElement}
      </View>
    </View>
  );
};
