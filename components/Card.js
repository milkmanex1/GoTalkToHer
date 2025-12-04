import React from 'react';
import { View, TouchableOpacity } from 'react-native';

export default function Card({ children, onPress, className = '' }) {
  const baseClasses = 'bg-surface rounded-xl p-4 shadow-sm border border-gray-100';
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} className={`${baseClasses} ${className}`}>
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View className={`${baseClasses} ${className}`}>
      {children}
    </View>
  );
}

