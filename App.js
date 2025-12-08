import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  registerForPushNotificationsAsync,
  scheduleDailyMotivationalNotification,
} from "./lib/notifications";
import AppNavigator from "./navigation/AppNavigator";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./global.css";

export default function App() {
  useEffect(() => {
    // Set Android navigation bar color to black
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
    }

    // Register for push notifications (fail silently if not available)
    registerForPushNotificationsAsync()
      .then(() => {
        // Schedule daily notifications
        scheduleDailyMotivationalNotification().catch((err) => {
          console.log("Could not schedule notifications:", err);
        });
      })
      .catch((error) => {
        // Silently fail if notifications aren't available (e.g., in simulator)
        console.log("Notifications not available:", error.message);
      });
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        <AppNavigator />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
