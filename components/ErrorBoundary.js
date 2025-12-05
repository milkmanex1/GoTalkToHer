import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView className="flex-1 bg-background">
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-2xl font-bold text-text mb-4">
              Something went wrong
            </Text>
            <Text className="text-base text-textSecondary mb-6 text-center">
              {this.state.error || 'An unexpected error occurred'}
            </Text>
            {this.state.errorInfo && (
              <ScrollView className="bg-surface border border-border p-4 rounded-lg mb-6 max-h-48">
                <Text style={{ fontSize: 12, color: '#A0A0A0', fontFamily: 'monospace' }}>
                  {this.state.errorInfo}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

