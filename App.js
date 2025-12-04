import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  registerForPushNotificationsAsync,
  scheduleDailyMotivationalNotification,
} from "./lib/notifications";
import AppNavigator from "./navigation/AppNavigator";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./global.css";

export default function App() {
  useEffect(() => {
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
    <ErrorBoundary>
      <StatusBar style="light" />
      <AppNavigator />
    </ErrorBoundary>
  );
}
