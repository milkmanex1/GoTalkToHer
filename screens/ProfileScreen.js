import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import BottomNavBar from "../components/BottomNavBar";
import { getActivityHeatmap } from "../lib/progress";

export default function ProfileScreen({ navigation }) {
  const { profile, session, loading: authLoading, ready } = useAuth();
  const [activityData, setActivityData] = useState([]);
  const [timerDuration, setTimerDuration] = useState(10); // Default to Balanced (10s)
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (profile) {
      loadActivityData();
      loadTimerDuration();
    }
  }, [profile]);

  const loadTimerDuration = useCallback(async () => {
    try {
      const duration = await Storage.getTimerDuration();
      setTimerDuration(duration);
    } catch (error) {
      console.error("Error loading timer duration:", error);
    }
  }, []);

  const handleTimerDurationChange = useCallback(async (duration) => {
    try {
      await Storage.setTimerDuration(duration);
      setTimerDuration(duration);
    } catch (error) {
      console.error("Error saving timer duration:", error);
    }
  }, []);

  const loadActivityData = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const heatmapData = await getActivityHeatmap(profile.id);
      setActivityData(heatmapData);
    } catch (error) {
      console.error("Error loading activity data:", error);
    }
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading while auth is initializing
  if (!ready || authLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#FF4FA3" />
          <Text className="text-textSecondary mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no session, redirect to login (shouldn't happen due to navigation guards)
  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no profile, redirect to onboarding (shouldn't happen due to navigation guards)
  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
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
              <Text
                style={{ fontSize: 18, color: "#FFFFFF", fontWeight: "600" }}
              >
                {profile.name || "Not set"}
              </Text>
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
                      {profile.past_successes || 0}
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
                      {profile.past_rejections || 0}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 48 }}>💪</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Your Progress Section */}
          <View style={{ marginTop: 8, marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#FFFFFF",
                marginBottom: 16,
              }}
            >
              Your Progress
            </Text>

            {/* Total Approaches */}
            <View style={{ marginBottom: 12 }}>
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
                      Total Approaches
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#FF4FA3",
                      }}
                    >
                      {profile.total_approaches || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Timer Runs */}
            <View style={{ marginBottom: 12 }}>
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
                      Timer Runs
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#FF4FA3",
                      }}
                    >
                      {profile.timer_runs || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Success Rate */}
            <View style={{ marginBottom: 12 }}>
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
                      Success Rate
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#4ADE80",
                      }}
                    >
                      {profile.success_rate
                        ? `${profile.success_rate.toFixed(1)}%`
                        : "0%"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Current Streak */}
            <View style={{ marginBottom: 12 }}>
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
                      Current Streak 🔥
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#FF4FA3",
                      }}
                    >
                      {profile.current_streak || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Longest Streak */}
            <View style={{ marginBottom: 12 }}>
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
                      Longest Streak 🏆
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#FFD700",
                      }}
                    >
                      {profile.longest_streak || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 7-Day Activity Heatmap */}
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#A0A0A0",
                  marginBottom: 12,
                }}
              >
                Activity Heatmap (Last 7 Days)
              </Text>
              <View className="bg-surface border border-border rounded-xl px-4 py-4">
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    minHeight: 120,
                  }}
                >
                  {activityData.map((day, index) => {
                    const maxCount = Math.max(
                      ...activityData.map((d) => d.count),
                      1
                    );
                    const height =
                      maxCount > 0 ? (day.count / maxCount) * 80 : 0;
                    return (
                      <View
                        key={index}
                        style={{
                          flex: 1,
                          alignItems: "center",
                          marginHorizontal: 2,
                        }}
                      >
                        <View
                          style={{
                            width: "100%",
                            height: Math.max(height, 4),
                            backgroundColor:
                              day.count > 0
                                ? "#FF4FA3"
                                : "rgba(160, 160, 160, 0.2)",
                            borderRadius: 4,
                            marginBottom: 8,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#A0A0A0",
                            marginBottom: 4,
                          }}
                        >
                          {day.count}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#A0A0A0",
                          }}
                        >
                          {day.dayName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={{ marginTop: 8, marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#FFFFFF",
                marginBottom: 16,
              }}
            >
              Preferences
            </Text>

            {/* Timer Settings */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#A0A0A0",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Timer Settings
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#808080",
                  marginBottom: 12,
                }}
              >
                Choose your courage level
              </Text>

              {/* Advanced (5s) */}
              <TouchableOpacity
                onPress={() => handleTimerDurationChange(5)}
                style={{ marginBottom: 12 }}
              >
                <View
                  className={`bg-surface border rounded-xl px-4 py-4 ${
                    timerDuration === 5 ? "border-primary" : "border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#FFFFFF",
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        Advanced
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#A0A0A0",
                        }}
                      >
                        5 seconds
                      </Text>
                    </View>
                    {timerDuration === 5 && (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#FF4FA3",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 16 }}>
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Recommended (10s) */}
              <TouchableOpacity
                onPress={() => handleTimerDurationChange(10)}
                style={{ marginBottom: 12 }}
              >
                <View
                  className={`bg-surface border rounded-xl px-4 py-4 ${
                    timerDuration === 10 ? "border-primary" : "border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#FFFFFF",
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        Recommended
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#A0A0A0",
                        }}
                      >
                        10 seconds
                      </Text>
                    </View>
                    {timerDuration === 10 && (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#FF4FA3",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 16 }}>
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Beginner (15s) */}
              <TouchableOpacity
                onPress={() => handleTimerDurationChange(15)}
                style={{ marginBottom: 12 }}
              >
                <View
                  className={`bg-surface border rounded-xl px-4 py-4 ${
                    timerDuration === 15 ? "border-primary" : "border-border"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#FFFFFF",
                          fontWeight: "600",
                          marginBottom: 4,
                        }}
                      >
                        Beginner
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#A0A0A0",
                        }}
                      >
                        15 seconds
                      </Text>
                    </View>
                    {timerDuration === 15 && (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#FF4FA3",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#FFFFFF", fontSize: 16 }}>
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
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
      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} currentRoute="Profile" />
    </SafeAreaView>
  );
}
