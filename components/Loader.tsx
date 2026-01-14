import { COLORS } from "@/constants/theme";
import { ActivityIndicator, View } from "react-native";

export function Loader() {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
