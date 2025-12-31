import React from "react";
import { View, Text } from "react-native";
import { theme } from "../src/theme/colors";

const ChatMessage = React.memo(({ message, isUser = false }) => {
  // Safety check for message content
  if (!message || typeof message !== 'string') {
    console.warn("ChatMessage: Invalid message prop:", message);
    return null;
  }

  try {
    return (
      <View className={`mb-4 ${isUser ? "items-end" : "items-start"}`}>
        <View
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary rounded-br-sm"
              : "bg-surface border border-border rounded-bl-sm"
          }`}
        >
          <Text
            style={{
              fontSize: 16,
              color: theme.text,
              lineHeight: 22.4,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    );
  } catch (error) {
    console.error("ChatMessage: Error rendering:", error);
    return null;
  }
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
