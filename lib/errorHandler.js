import { Alert } from 'react-native';

export const handleError = (error, customMessage = null) => {
  console.error('Error:', error);
  
  let message = customMessage || 'Something went wrong. Please try again.';
  
  if (error?.message) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      message = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    } else {
      message = error.message;
    }
  }
  
  Alert.alert('Error', message);
};

export const showSuccess = (message) => {
  Alert.alert('Success', message);
};

