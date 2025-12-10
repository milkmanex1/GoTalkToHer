import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { theme } from "../src/theme/colors";

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}) {
  // Primary: Pink background, white text, 60-70px height, full pill
  // Secondary: Transparent, pink border, pink text, 48-52px height
  const baseClasses =
    variant === "primary"
      ? "px-6 rounded-full items-center justify-center min-h-[60px] max-h-[70px]"
      : "px-6 rounded-full items-center justify-center min-h-[48px] max-h-[52px] border-2";

  const getBackgroundColor = () => {
    if (variant === "primary") return theme.primary;
    return "transparent";
  };

  const getBorderColor = () => {
    if (variant === "primary") return undefined;
    return theme.primary;
  };

  const getTextColor = () => {
    if (variant === "primary") return theme.text;
    return theme.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
        borderWidth: variant === "primary" ? 0 : 2,
        opacity: disabled || loading ? 0.5 : 1,
      }}
      className={`${baseClasses} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? theme.text : theme.primary}
        />
      ) : (
        <Text
          style={{
            color: getTextColor(),
            fontSize: variant === "primary" ? 18 : 16,
            fontWeight: variant === "primary" ? "bold" : "600",
          }}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
