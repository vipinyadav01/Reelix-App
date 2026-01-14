import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  onButtonPress?: () => void;
  buttonIcon?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  buttonText,
  onButtonPress,
  buttonIcon,
}: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-10 py-16 bg-black">
      <View className="mb-6 opacity-80">
        <Ionicons
          name={icon as any}
          size={64}
          color={theme.color.textSecondary.dark}
        />
      </View>

      <Text className="text-2xl font-bold text-white text-center mb-3 tracking-tighter">{title}</Text>
      <Text className="text-base text-neutral-400 text-center leading-6 mb-8 px-5">{subtitle}</Text>

      {buttonText && onButtonPress && (
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-full flex-row items-center justify-center shadow-lg shadow-blue-500/30"
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          {buttonIcon && (
            <Ionicons
              name={buttonIcon as any}
              size={20}
              color="black"
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-black text-base font-semibold">{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
