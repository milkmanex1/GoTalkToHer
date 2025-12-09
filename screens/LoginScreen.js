import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { handleError } from "../lib/errorHandler";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: "myapp://auth-callback",
        },
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      handleError(error, "Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
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
                color: "#FFFFFF",
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
                color: "#D0D0D0",
                marginBottom: 48,
                textAlign: "center",
                lineHeight: 22.4,
              }}
            >
              Sign in with a magic link sent to your email
            </Text>

            {/* Success Message */}
            {success && (
              <View
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderColor: "#22C55E",
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#22C55E",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Magic link sent! Check your email.
                </Text>
              </View>
            )}

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
                onChangeText={(text) => {
                  setEmail(text);
                  setSuccess(false);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Send Magic Link Button */}
            <Button
              title={loading ? "Sending..." : "Send Magic Link"}
              onPress={handleSendMagicLink}
              disabled={loading || success}
              loading={loading}
              className="w-full mb-6"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
