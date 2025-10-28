import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon as any}
          size={64}
          color={theme.color.textSecondary.dark}
        />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          {buttonIcon && (
            <Ionicons
              name={buttonIcon as any}
              size={20}
              color={theme.colorBlack}
              style={styles.buttonIcon}
            />
          )}
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
    backgroundColor: theme.color.background.dark,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colorWhite,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.color.textSecondary.dark,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: theme.color.reactBlue.light,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.color.reactBlue.light,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: theme.colorBlack,
    fontSize: 16,
    fontWeight: "600",
  },
});
