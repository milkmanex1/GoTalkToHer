import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        navigation.replace("Login");
        return;
      }

      const authUserId = user.id;

      // Load profile by auth_user_id
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        if (error.code === "PGRST116") {
          navigation.replace("Onboarding");
          return;
        }
        throw error;
      }

      if (!data) {
        navigation.replace("Onboarding");
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FF4FA3" />
        <Text className="text-textSecondary mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-textSecondary">Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Header */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: 32,
            textAlign: "center",
          }}
        >
          Your Profile
        </Text>

        {/* Name */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#A0A0A0",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Name
          </Text>
          <View className="bg-surface border border-border rounded-xl px-4 py-3">
            <Text style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}>
              {userProfile.name || "Not set"}
            </Text>
          </View>
        </View>

        {/* Age Range */}
        {userProfile.age_range && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#A0A0A0",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Age Range
            </Text>
            <View className="bg-surface border border-border rounded-xl px-4 py-3">
              <Text
                style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}
              >
                {userProfile.age_range}
              </Text>
            </View>
          </View>
        )}

        {/* Confidence Level */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#A0A0A0",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Confidence Level
          </Text>
          <View className="bg-surface border border-border rounded-xl px-4 py-3">
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}
              >
                {userProfile.confidence_level || 0}/10
              </Text>
              <View className="flex-row flex-1 mx-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <View
                    key={level}
                    className={`flex-1 h-2 mx-0.5 rounded ${
                      level <= (userProfile.confidence_level || 0)
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Biggest Challenge */}
        {userProfile.biggest_challenge && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#A0A0A0",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Biggest Challenge
            </Text>
            <View className="bg-surface border border-border rounded-xl px-4 py-3">
              <Text
                style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}
              >
                {userProfile.biggest_challenge}
              </Text>
            </View>
          </View>
        )}

        {/* Fear Type */}
        {userProfile.fear_type && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                color: "#A0A0A0",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Fear Type
            </Text>
            <View className="bg-surface border border-border rounded-xl px-4 py-3">
              <Text
                style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}
              >
                {userProfile.fear_type}
              </Text>
            </View>
          </View>
        )}

        {/* Preferred Environments */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 16,
              color: "#A0A0A0",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Preferred Environments
          </Text>
          <View className="bg-surface border border-border rounded-xl px-4 py-3">
            {userProfile.preferred_environments &&
            userProfile.preferred_environments.length > 0 ? (
              userProfile.preferred_environments.map((env, index) => (
                <Text
                  key={index}
                  style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}
                >
                  {env}
                  {index < userProfile.preferred_environments.length - 1 &&
                    ", "}
                </Text>
              ))
            ) : (
              <Text
                style={{ fontSize: 18, color: "#A0A0A0", fontWeight: "600" }}
              >
                None set
              </Text>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={{ marginTop: 8, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Your Stats
          </Text>

          {/* Past Successes */}
          <View style={{ marginBottom: 16 }}>
            <View className="bg-surface border border-border rounded-xl px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#A0A0A0",
                      marginBottom: 4,
                    }}
                  >
                    Past Successes
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#4ADE80",
                    }}
                  >
                    {userProfile.past_successes || 0}
                  </Text>
                </View>
                <Text style={{ fontSize: 48 }}>🎉</Text>
              </View>
            </View>
          </View>

          {/* Past Rejections */}
          <View style={{ marginBottom: 16 }}>
            <View className="bg-surface border border-border rounded-xl px-4 py-4">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#A0A0A0",
                      marginBottom: 4,
                    }}
                  >
                    Past Rejections
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#F87171",
                    }}
                  >
                    {userProfile.past_rejections || 0}
                  </Text>
                </View>
                <Text style={{ fontSize: 48 }}>💪</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-surface border border-red-500 rounded-xl px-4 py-4 items-center mt-8"
        >
          <Text style={{ fontSize: 16, color: "#F87171", fontWeight: "600" }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
