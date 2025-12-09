import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { handleError } from "../lib/errorHandler";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (!authData?.user) {
        throw new Error("Failed to create user account");
      }

      const userId = authData.user.id;

      // Create user_profile row with the Supabase user ID
      const { error: profileError } = await supabase
        .from("user_profile")
        .insert([
          {
            auth_user_id: userId,
            name: "", // Will be filled in onboarding
            age_range: "23-27",
            confidence_level: 5,
            biggest_challenge: "Fear of rejection",
            fear_type: "Fear of rejection",
            preferred_environments: [],
            past_successes: 0,
            past_rejections: 0,
          },
        ]);

      if (profileError) {
        // If profile creation fails, try to clean up the auth user
        console.error("Profile creation error:", profileError);
        // Note: We can't easily delete the auth user here, but the user can try again
        throw new Error(
          "Account created but profile setup failed. Please try logging in."
        );
      }

      // Navigate to Onboarding to complete profile
      navigation.replace("Onboarding");
    } catch (error) {
      handleError(
        error,
        "Failed to create account. Please try again or sign in if you already have an account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={[]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView 
          className="flex-1 bg-background"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
        >
        <View style={{ paddingHorizontal: 24, paddingVertical: 48 }}>
        {/* Large Title */}
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
          Create Account
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#D0D0D0",
            marginBottom: 48,
            textAlign: "center",
            lineHeight: 22.4,
          }}
        >
          Sign up to get started on your journey
        </Text>

        {/* Email Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Email
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3"
            style={{ fontSize: 16, color: "#FFFFFF" }}
            placeholder="Enter your email"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Password
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3"
            style={{ fontSize: 16, color: "#FFFFFF" }}
            placeholder="Enter your password (min 6 characters)"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />
        </View>

        {/* Confirm Password Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 12,
            }}
          >
            Confirm Password
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3"
            style={{ fontSize: 16, color: "#FFFFFF" }}
            placeholder="Confirm your password"
            placeholderTextColor="#A0A0A0"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />
        </View>

        {/* Register Button */}
        <Button
          title={loading ? "Creating account..." : "Sign Up"}
          onPress={handleRegister}
          disabled={loading}
          loading={loading}
          className="w-full mb-6"
        />

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text style={{ fontSize: 16, color: "#D0D0D0" }}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text
              style={{
                fontSize: 16,
                color: "#FF4FA3",
                fontWeight: "600",
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

