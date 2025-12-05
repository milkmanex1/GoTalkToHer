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
  // Primary: Pink background, white text, 60-70px height, full pill
  // Secondary: Transparent, pink border, pink text, 48-52px height
  const baseClasses = variant === 'primary' 
    ? 'px-6 rounded-full items-center justify-center min-h-[60px] max-h-[70px]'
    : 'px-6 rounded-full items-center justify-center min-h-[48px] max-h-[52px] border-2';
  
  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-transparent border-primary',
    outline: 'bg-transparent border-primary',
  };
  
  const textClasses = {
    primary: 'text-white font-bold text-lg',
    secondary: 'text-primary font-semibold text-base',
    outline: 'text-primary font-semibold text-base',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#FF4FA3'} />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

