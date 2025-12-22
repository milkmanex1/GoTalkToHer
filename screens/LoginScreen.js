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
import { theme } from "../src/theme/colors";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      // Check if user has a profile
      if (data?.user?.id) {
        const { data: profile, error: profileError } = await supabase
          .from("user_profile")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          // Profile doesn't exist (PGRST116 = no rows returned)
          if (profileError.code === "PGRST116") {
            // Navigate to Onboarding to create profile
            navigation.navigate("Onboarding");
          } else {
            throw profileError;
          }
        } else {
          // Profile exists, navigate to Home
          navigation.navigate("Home");
        }
      } else {
        // Fallback: navigate to Home if user ID is not available
        navigation.navigate("Home");
      }
    } catch (error) {
      handleError(error, "Failed to log in. Please try again.");
    } finally {
      setLoading(false);
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
            {/* Large Title */}
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
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 48,
                textAlign: "center",
                lineHeight: 22.4,
              }}
            >
              Sign in with your email and password
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Email
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3"
                style={{ fontSize: 16, color: theme.text }}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Password
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3"
                style={{ fontSize: 16, color: theme.text }}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
              />
            </View>

            {/* Log In Button */}
            <Button
              title={loading ? "Logging In..." : "Log In"}
              onPress={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
              loading={loading}
              className="w-full mb-6"
            />

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text style={{ fontSize: 16, color: theme.textSecondary }}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.primary,
                    fontWeight: "600",
                  }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
