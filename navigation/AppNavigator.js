import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import LoginScreen from "../screens/LoginScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import ApproachTimerScreen from "../screens/ApproachTimerScreen";
import ConversationStartersScreen from "../screens/ConversationStartersScreen";
import MotivationBoostScreen from "../screens/MotivationBoostScreen";
import PostActionReviewScreen from "../screens/PostActionReviewScreen";
import WingmanChatScreen from "../screens/WingmanChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TestScreen from "../screens/TestScreen";

const Stack = createStackNavigator();

// Create navigation ref for global navigation access
export const navigationRef = React.createRef();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRoute();

    // Global auth listener - handles magic link callbacks and auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process if navigation is ready
      if (!navigationRef.current?.isReady()) {
        return;
      }

      if (session?.user) {
        // Validate user exists
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // Invalid session, sign out and go to login
          await supabase.auth.signOut();
          await Storage.removeUserId();
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
          setLoading(false);
          return;
        }

        // Check if profile exists
        const { data: profile } = await supabase
          .from("user_profile")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          await Storage.setUserId(user.id);
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        } else {
          // If profile missing, treat session as invalid
          await supabase.auth.signOut();
          await Storage.removeUserId();
          navigationRef.current?.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      } else {
        // User is signed out
        await Storage.removeUserId();
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkAuthAndRoute() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setInitialRoute("Login");
      setLoading(false);
      return;
    }

    const supabaseUser = session.user;

    const { data: profile } = await supabase
      .from("user_profile")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    if (!profile) {
      // Stale or incomplete session → force logout
      await supabase.auth.signOut();
      await Storage.removeUserId();
      setInitialRoute("Login");
      setLoading(false);
      return;
    }

    setInitialRoute("Home");
    setLoading(false);
  }

  if (loading || !initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0E0F12",
        }}
      >
        <ActivityIndicator size="large" color="#FF4FA3" />
        <Text style={{ color: "#D0D0D0", marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0E0F12",
            borderBottomColor: "#2D2F34",
            borderBottomWidth: 1,
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
            color: "#FFFFFF",
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
              backgroundColor: "#0E0F12",
              borderBottomColor: "#2D2F34",
              borderBottomWidth: 1,
              height: 100,
            },
            headerTitleAlign: "center",
          })}
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
          name="WingmanChat"
          component={WingmanChatScreen}
          options={{ title: "Wingman AI Chat", keyboardHandlingEnabled: true }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Your Profile" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
