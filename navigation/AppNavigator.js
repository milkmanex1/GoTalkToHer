import React, { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { theme } from "../src/theme/colors";
import { getLatestWeeklyInsights } from "../lib/insights";
import LoginScreen from "../screens/LoginScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import ApproachTimerScreen from "../screens/ApproachTimerScreen";
import ConversationStartersScreen from "../screens/ConversationStartersScreen";
import MotivationBoostScreen from "../screens/MotivationBoostScreen";
import PostActionReviewScreen from "../screens/PostActionReviewScreen";
import ReviewSubmittedScreen from "../screens/ReviewSubmittedScreen";
import WingmanChatScreen from "../screens/WingmanChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TestScreen from "../screens/TestScreen";
import SituationSelectScreen from "../screens/SituationSelectScreen";
import SituationPrepScreen from "../screens/SituationPrepScreen";
import WeeklyInsightsScreen from "../screens/WeeklyInsightsScreen";

// Custom header component for ReviewSubmitted screen
const ReviewSubmittedHeader = () => (
  <Text
    style={{
      fontSize: Platform.select({ ios: 17, android: 20 }),
      fontWeight: "bold",
      color: theme.text,
    }}
  >
    Review Submitted
  </Text>
);

const Stack = createStackNavigator();

// Create navigation ref for global navigation access
export const navigationRef = React.createRef();

export default function AppNavigator() {
  const { session, profile, ready, loading } = useAuth();
  const isInitialMount = useRef(true);
  const mondayPromptChecked = useRef(false);

  // Optional: Auto-prompt on Monday if no insights generated this week
  useEffect(() => {
    if (!ready || loading || !session || !profile) return;

    // Only check once per app session
    if (mondayPromptChecked.current) return;
    mondayPromptChecked.current = true;

    const checkMondayPrompt = async () => {
      try {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Only prompt on Monday
        if (dayOfWeek !== 1) return;

        // Check if insights were generated this week
        const latestInsight = await getLatestWeeklyInsights(profile.id);
        if (!latestInsight) {
          // No insights exist - navigate after a short delay to let Home screen load
          setTimeout(() => {
            navigationRef.current?.navigate("WeeklyInsights");
          }, 1000);
          return;
        }

        // Check if insights are older than 7 days
        const generatedAt = new Date(latestInsight.generatedAt);
        const daysDiff = (today - generatedAt) / (1000 * 60 * 60 * 24);

        if (daysDiff >= 7) {
          // Navigate to insights screen
          setTimeout(() => {
            navigationRef.current?.navigate("WeeklyInsights");
          }, 1000);
        }
      } catch (error) {
        // Silently fail - this is optional functionality
        console.log("Monday prompt check failed:", error);
      }
    };

    // Only check if user is logged in and has profile
    if (session && profile) {
      checkMondayPrompt();
    }
  }, [ready, loading, session, profile]);

  // Reset navigation when auth state changes (after initial load)
  useEffect(() => {
    if (!ready || loading) return;

    // Skip reset on initial mount - initialRouteName handles that
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only reset when auth state changes after mount
    if (!session) {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } else if (session && !profile) {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Onboarding" }],
      });
    } else if (session && profile) {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  }, [ready, loading, session, profile]);

  // Show loading screen while auth is initializing
  if (!ready || loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 16 }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Determine initial route based on auth state
  let initialRoute = "Login";
  if (session && profile) {
    initialRoute = "Home";
  } else if (session && !profile) {
    initialRoute = "Onboarding";
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: "bold",
            color: theme.text,
          },
        }}
      >
        {/* Auth Stack */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false, keyboardHandlingEnabled: true }}
        />

        {/* Onboarding Stack */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false, keyboardHandlingEnabled: true }}
        />

        {/* App Stack */}
        <Stack.Screen
          name="Test"
          component={TestScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: "Go Talk To Her",
            headerStyle: {
              backgroundColor: theme.background,
              borderBottomColor: theme.border,
              borderBottomWidth: 1,
              height: 100,
            },
            headerTitleAlign: "center",
          })}
        />
        <Stack.Screen
          name="SituationSelect"
          component={SituationSelectScreen}
          options={{ title: "Choose Situation" }}
        />
        <Stack.Screen
          name="SituationPrep"
          component={SituationPrepScreen}
          options={{ title: "Your Approach Plan" }}
        />
        <Stack.Screen
          name="ApproachTimer"
          component={ApproachTimerScreen}
          options={{ title: "Approach Timer" }}
        />
        <Stack.Screen
          name="ConversationStarters"
          component={ConversationStartersScreen}
          options={{ title: "Conversation Starters" }}
        />
        <Stack.Screen
          name="MotivationBoost"
          component={MotivationBoostScreen}
          options={{ title: "Motivation Boost" }}
        />
        <Stack.Screen
          name="PostActionReview"
          component={PostActionReviewScreen}
          options={{
            title: "Post-Action Review",
            keyboardHandlingEnabled: true,
          }}
        />
        <Stack.Screen
          name="ReviewSubmitted"
          component={ReviewSubmittedScreen}
          options={{
            headerTitle: () => <ReviewSubmittedHeader />,
            headerTitleAlign: "left",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="WingmanChat"
          component={WingmanChatScreen}
          options={{ title: "Wingman AI Chat", keyboardHandlingEnabled: true }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Your Profile" }}
        />
        <Stack.Screen
          name="WeeklyInsights"
          component={WeeklyInsightsScreen}
          options={{ title: "Weekly Insights" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
