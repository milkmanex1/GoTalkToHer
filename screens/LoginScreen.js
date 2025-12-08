import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { handleError } from "../lib/errorHandler";

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

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      if (data?.user) {
        // Navigate to Home - AppNavigator will handle checking for profile
        navigation.replace("Home");
      }
    } catch (error) {
      handleError(error, "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top']}>
      <ScrollView 
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
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
          Sign in to continue your journey
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
            placeholder="Enter your password"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        {/* Login Button */}
        <Button
          title={loading ? "Signing in..." : "Sign In"}
          onPress={handleLogin}
          disabled={loading}
          loading={loading}
          className="w-full mb-6"
        />

        {/* Register Link */}
        <View className="flex-row justify-center items-center">
          <Text style={{ fontSize: 16, color: "#D0D0D0" }}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text
              style={{
                fontSize: 16,
                color: "#FF4FA3",
                fontWeight: "600",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

