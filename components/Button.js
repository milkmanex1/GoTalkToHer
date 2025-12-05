import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false,
  className = '',
}) {
  const baseClasses = 'px-6 py-4 rounded-full items-center justify-center min-h-[52px]';
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    outline: 'bg-transparent border border-primary',
  };
  const textClasses = {
    primary: 'text-white font-bold text-lg',
    secondary: 'text-white font-bold text-lg',
    accent: 'text-white font-bold text-lg',
    outline: 'text-textSecondary font-semibold text-base',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#FF3E84' : '#ffffff'} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

