import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import BottomNavBar from "../components/BottomNavBar";
import { getActivityHeatmap } from "../lib/progress";

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const insets = useSafeAreaInsets();
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadUserProfile();
    });
    // Load profile on initial mount
    loadUserProfile();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (userProfile && isMountedRef.current) {
      loadActivityData();
    }
  }, [userProfile]);

  const loadUserProfile = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);

    try {
      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      
      if (!isMountedRef.current) return;
      
      if (authError || !user) {
        navigation.replace("Login");
        return;
      }

      const userId = user.id;

      // Load profile by id
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (!isMountedRef.current) return;

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

      if (isMountedRef.current) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      if (isMountedRef.current) {
        setLoading(false);
      }
    } finally {
      if (isMountedRef.current) {
        isLoadingRef.current = false;
        setLoading(false);
      }
    }
  }, [navigation]);

  const loadActivityData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!isMountedRef.current) return;
      
      if (user) {
        const heatmapData = await getActivityHeatmap(user.id);
        if (isMountedRef.current) {
          setActivityData(heatmapData);
        }
      }
    } catch (error) {
      console.error("Error loading activity data:", error);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      await Storage.removeUserId();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color="#FF4FA3" />
          <Text className="text-textSecondary mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={[]}>
      <ScrollView 
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
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
                    {userProfile.total_approaches || 0}
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
                    {userProfile.timer_runs || 0}
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
                    {userProfile.success_rate
                      ? `${userProfile.success_rate.toFixed(1)}%`
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
                    {userProfile.current_streak || 0}
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
                    {userProfile.longest_streak || 0}
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
                  const height = maxCount > 0 ? (day.count / maxCount) * 80 : 0;
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
                            day.count > 0 ? "#FF4FA3" : "rgba(160, 160, 160, 0.2)",
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
