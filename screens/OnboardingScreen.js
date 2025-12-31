import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { handleError } from "../lib/errorHandler";
import { theme } from "../src/theme/colors";

const CHALLENGES = [
  "Fear of rejection",
  "Overthinking",
  "Awkwardness",
  "Not knowing what to say",
  "Lack of confidence",
  "Social anxiety",
];

const AGE_RANGES = ["18-22", "23-27", "28-32", "33-37", "38-42", "43+"];

export default function OnboardingScreen({ navigation }) {
  const { session, refresh } = useAuth();
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("23-27");
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [biggestChallenge, setBiggestChallenge] = useState(CHALLENGES[0]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const isMountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auth guard: Ensure user is authenticated before showing onboarding
  useEffect(() => {
    if (session === null) {
      navigation.replace("Login");
    }
  }, [session, navigation]);

  // Ensure ageRange is always a valid value from AGE_RANGES
  useEffect(() => {
    if (!AGE_RANGES.includes(ageRange)) {
      setAgeRange(AGE_RANGES[0]);
    }
  }, []);

  // Ensure biggestChallenge is always a valid value from CHALLENGES
  useEffect(() => {
    if (!CHALLENGES.includes(biggestChallenge)) {
      setBiggestChallenge(CHALLENGES[0]);
    }
  }, []);

  const handleSubmit = async () => {
    console.log("Onboarding: handleSubmit called");
    
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    // Prevent multiple submissions
    if (loading) {
      console.log("Onboarding: Already loading, ignoring submit");
      return;
    }

    if (!isMountedRef.current) {
      console.log("Onboarding: Component unmounted, aborting submit");
      return;
    }

    setLoading(true);
    console.log("Onboarding: Starting profile update");
    
    try {
      // Get authenticated user ID from session
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession?.user?.id) {
        console.error("Onboarding: No authenticated user found");
        if (isMountedRef.current) {
          setLoading(false);
          Alert.alert("Error", "No authenticated user found");
          navigation.replace("Login");
        }
        return;
      }

      const userId = currentSession.user.id;
      console.log("Onboarding: Updating profile for user:", userId);

      // Update the existing profile using the authenticated user's ID
      const { data, error } = await supabase
        .from("user_profile")
        .update({
          name: name.trim(),
          age_range: ageRange,
          confidence_level: confidenceLevel,
          biggest_challenge: biggestChallenge,
          fear_type: biggestChallenge,
          preferred_environments: [],
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Onboarding: Profile update error:", error);
        throw error;
      }

      if (!data) {
        console.error("Onboarding: Profile update returned no data");
        throw new Error("Profile update returned no data");
      }

      console.log("Onboarding: Profile updated successfully");

      // Refresh profile so AuthContext updates immediately
      // Wrap in try-catch to prevent navigation issues if refresh fails
      try {
        console.log("Onboarding: Refreshing profile in AuthContext");
        await refresh();
        console.log("Onboarding: Profile refresh completed");
      } catch (refreshError) {
        console.error("Onboarding: Refresh error (non-fatal):", refreshError);
        // Continue with navigation even if refresh fails
        // The profile was updated successfully in the database
      }

      // Check if component is still mounted before updating state/navigating
      if (!isMountedRef.current) {
        console.log("Onboarding: Component unmounted during update, aborting navigation");
        return;
      }

      // Reset loading before navigation to prevent state update issues
      setLoading(false);

      // Small delay to ensure all state updates are complete before navigation
      // This prevents crashes from navigation during React state updates
      setTimeout(() => {
        if (!isMountedRef.current) {
          console.log("Onboarding: Component unmounted before navigation");
          return;
        }
        
        try {
          console.log("Onboarding: Navigating to Home");
          if (navigation && navigation.replace) {
            navigation.replace("Home");
            console.log("Onboarding: Navigation successful");
          } else {
            console.error("Onboarding: Navigation not available");
          }
        } catch (navError) {
          console.error("Onboarding: Navigation error:", navError);
          // Fallback: try navigate instead of replace
          try {
            if (navigation && navigation.navigate) {
              navigation.navigate("Home");
            }
          } catch (fallbackError) {
            console.error("Onboarding: Fallback navigation also failed:", fallbackError);
          }
        }
      }, 50);
    } catch (error) {
      console.error("Onboarding: Submit error:", error);
      if (isMountedRef.current) {
        setLoading(false);
        handleError(error, "Failed to save profile. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal: 24, paddingVertical: 48 }}>
            {/* Large Title: 26-28 bold */}
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 16,
                textAlign: "center",
                lineHeight: 36.4,
              }}
            >
              Welcome to Go Talk To Her
            </Text>
            {/* Body: 16-18 regular */}
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 48,
                textAlign: "center",
                lineHeight: 22.4,
              }}
            >
              We're here to help you overcome approach anxiety and build
              confidence in real-world interactions. Let's get started!
            </Text>

            {/* Component spacing: 20-28 */}
            <View style={{ marginBottom: 24 }}>
              {/* Medium Title: 20-22 semi-bold */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Name / Nickname
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3"
                style={{ fontSize: 16, color: theme.text }}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Age Range
              </Text>
              <View className="bg-surface border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={ageRange}
                  onValueChange={setAgeRange}
                  style={{ color: theme.text }}
                >
                  {AGE_RANGES.map((range) => (
                    <Picker.Item key={range} label={range} value={range} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Confidence Level: {confidenceLevel}/10
              </Text>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  Low
                </Text>
                <View className="flex-1 mx-4">
                  <View className="flex-row">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                      <View
                        key={level}
                        onTouchEnd={() => setConfidenceLevel(level)}
                        className={`flex-1 h-10 mx-0.5 rounded-lg ${
                          level <= confidenceLevel ? "bg-primary" : "bg-border"
                        }`}
                      />
                    ))}
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  High
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 40 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Biggest Challenge
              </Text>
              <View className="bg-surface border border-border rounded-xl overflow-hidden">
                <Picker
                  selectedValue={biggestChallenge}
                  onValueChange={setBiggestChallenge}
                  style={{ color: theme.text }}
                >
                  {CHALLENGES.map((challenge) => (
                    <Picker.Item
                      key={challenge}
                      label={challenge}
                      value={challenge}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <Button
              title={loading ? "Saving..." : "Get Started"}
              onPress={handleSubmit}
              disabled={loading}
              loading={loading}
              className="w-full"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
