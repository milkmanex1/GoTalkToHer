import React from "react";
import { View, TouchableOpacity } from "react-native";

export default function Card({ children, onPress, className = "" }) {
  const baseClasses = "bg-surface rounded-xl p-4 border border-border";

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className={`${baseClasses} ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={`${baseClasses} ${className}`}>{children}</View>;
}
