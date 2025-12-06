import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import { handleError } from "../lib/errorHandler";

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
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("23-27");
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [biggestChallenge, setBiggestChallenge] = useState(CHALLENGES[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      // Get or create authenticated user
      let authUserId;
      let { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth?.user) {
        // No authenticated user, create an anonymous session
        // Generate a unique email for anonymous user (UUID-based to ensure uniqueness)
        const uuid = () => {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            }
          );
        };

        const anonymousEmail = `${uuid()}@anonymous.talktoher.app`;
        const anonymousPassword = uuid() + uuid(); // Long random password

        // Sign up with anonymous credentials
        // Note: Make sure email confirmation is disabled in Supabase Auth settings
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: anonymousEmail,
            password: anonymousPassword,
            options: {
              emailRedirectTo: undefined,
              data: {
                is_anonymous: true,
              },
            },
          });

        if (signUpError) {
          // If sign up fails, try to sign in (in case user already exists somehow)
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email: anonymousEmail,
              password: anonymousPassword,
            });

          if (signInError || !signInData?.user) {
            console.error("Sign up error:", signUpError);
            console.error("Sign in error:", signInError);
            throw new Error(
              "Failed to create user session. Please check your Supabase Auth settings - email confirmation should be disabled."
            );
          }

          authUserId = signInData.user.id;
        } else if (!signUpData?.user) {
          throw new Error("Failed to create user session. Please try again.");
        } else {
          authUserId = signUpData.user.id;

          // Check if we have a session (email confirmation might be required)
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            // If no session, email confirmation might be required
            // Try to get the user anyway - RLS might still work
            console.warn(
              "No session after signup - email confirmation might be required"
            );
          }
        }
      } else {
        authUserId = auth.user.id;
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from("user_profile")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();

      if (existingProfile) {
        // Profile already exists, skip onboarding
        await Storage.setAuthUserId(authUserId);
        navigation.replace("Home");
        return;
      }

      // Insert new profile with auth_user_id
      const { data, error } = await supabase
        .from("user_profile")
        .insert([
          {
            auth_user_id: authUserId,
            name: name.trim(),
            age_range: ageRange,
            confidence_level: confidenceLevel,
            biggest_challenge: biggestChallenge,
            fear_type: biggestChallenge,
            preferred_environments: [],
            past_successes: 0,
            past_rejections: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Save auth user ID to local storage
      await Storage.setAuthUserId(authUserId);

      navigation.replace("Home");
    } catch (error) {
      handleError(error, "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View style={{ paddingHorizontal: 24, paddingVertical: 48 }}>
        {/* Large Title: 26-28 bold */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#FFFFFF",
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
            color: "#D0D0D0",
            marginBottom: 48,
            textAlign: "center",
            lineHeight: 22.4,
          }}
        >
          We're here to help you overcome approach anxiety and build confidence
          in real-world interactions. Let's get started!
        </Text>

        {/* Component spacing: 20-28 */}
        <View style={{ marginBottom: 24 }}>
          {/* Medium Title: 20-22 semi-bold */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Name / Nickname
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3"
            style={{ fontSize: 16, color: "#FFFFFF" }}
            placeholder="Enter your name"
            placeholderTextColor="#A0A0A0"
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
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Age Range
          </Text>
          <View className="bg-surface border border-border rounded-xl overflow-hidden">
            <Picker
              selectedValue={ageRange}
              onValueChange={setAgeRange}
              style={{ color: "#FFFFFF" }}
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
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Confidence Level: {confidenceLevel}/10
          </Text>
          <View className="flex-row items-center justify-between">
            <Text style={{ fontSize: 13, color: "#A0A0A0" }}>Low</Text>
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
            <Text style={{ fontSize: 13, color: "#A0A0A0" }}>High</Text>
          </View>
        </View>

        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Biggest Challenge
          </Text>
          <View className="bg-surface border border-border rounded-xl overflow-hidden">
            <Picker
              selectedValue={biggestChallenge}
              onValueChange={setBiggestChallenge}
              style={{ color: "#FFFFFF" }}
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
  );
}
