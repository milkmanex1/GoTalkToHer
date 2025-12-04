import React from 'react';
import { View, Text } from 'react-native';

export default function ChatMessage({ message, isUser = false }) {
  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary rounded-br-sm'
            : 'bg-gray-100 rounded-bl-sm'
        }`}
      >
        <Text
          className={`text-base ${
            isUser ? 'text-white' : 'text-text'
          }`}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

