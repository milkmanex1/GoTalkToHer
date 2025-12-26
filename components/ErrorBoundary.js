import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { theme } from "../src/theme/colors";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced logging for debugging crashes
    const errorDetails = {
      message: error?.message || error?.toString() || "Unknown error",
      stack: error?.stack || "No stack trace",
      componentStack: errorInfo?.componentStack || "No component stack",
      timestamp: new Date().toISOString(),
    };
    
    console.error("=== ERROR BOUNDARY CAUGHT ERROR ===");
    console.error("Error:", errorDetails.message);
    console.error("Stack:", errorDetails.stack);
    console.error("Component Stack:", errorDetails.componentStack);
    console.error("Timestamp:", errorDetails.timestamp);
    console.error("Full Error Object:", error);
    console.error("Full Error Info:", errorInfo);
    console.error("===================================");
    
    // Try to log to AsyncStorage for persistence (optional)
    try {
      // You can add AsyncStorage logging here if needed
    } catch (storageError) {
      console.error("Failed to save error to storage:", storageError);
    }
    
    this.setState({
      error: errorDetails.message,
      errorInfo: errorDetails.componentStack,
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
              {this.state.error || "An unexpected error occurred"}
            </Text>
            {this.state.errorInfo && (
              <ScrollView className="bg-surface border border-border p-4 rounded-lg mb-6 max-h-48">
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.textSecondary,
                    fontFamily: "monospace",
                  }}
                >
                  {this.state.errorInfo}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
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
