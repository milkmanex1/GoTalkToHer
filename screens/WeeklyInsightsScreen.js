import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import {
  ensureWeeklyInsightsGenerated,
  getLatestWeeklyInsights,
  generateWeeklyInsights,
} from "../lib/insights";
import { theme } from "../src/theme/colors";
import Card from "../components/Card";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";

export default function WeeklyInsightsScreen({ navigation }) {
  const { profile, ready } = useAuth();
  const [insights, setInsights] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  const loadInsights = useCallback(async (isRefresh = false) => {
    if (!profile?.id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Ensure insights are generated if needed
      const result = await ensureWeeklyInsightsGenerated(profile.id);

      if (result) {
        setInsights(result.insights);
        setChallenge(result.challenge);
      } else {
        // Try to get latest insights
        const latest = await getLatestWeeklyInsights(profile.id);
        if (latest) {
          setInsights(latest.insights);
          setChallenge(latest.challenge);
        } else {
          // Generate new insights if none exist
          const newResult = await generateWeeklyInsights(profile.id);
          setInsights(newResult.insights);
          setChallenge(newResult.challenge);
        }
      }
    } catch (err) {
      console.error("Error loading insights:", err);
      setError("Couldn't load your insights. Try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    if (ready && profile) {
      loadInsights();
    }
  }, [ready, profile, loadInsights]);

  useFocusEffect(
    useCallback(() => {
      if (ready && profile) {
        loadInsights();
      }
    }, [ready, profile, loadInsights])
  );

  const handleRefresh = async () => {
    if (!profile?.id) return;

    try {
      setRefreshing(true);
      setError(null);

      // Manually regenerate insights
      const result = await generateWeeklyInsights(profile.id);
      setInsights(result.insights);
      setChallenge(result.challenge);
    } catch (err) {
      console.error("Error refreshing insights:", err);
      setError("Couldn't refresh your insights. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  if (!ready || loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="text-textSecondary mt-4">Loading insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
          {/* Header */}
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Your Weekly Insights
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 24,
              }}
            >
              Based on your recent approaches and actions
            </Text>
          </View>

          {/* Error State */}
          {error && (
            <Card className="mb-6">
              <View className="items-center py-4">
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.error,
                    marginBottom: 12,
                    textAlign: "center",
                  }}
                >
                  {error}
                </Text>
                <TouchableOpacity
                  onPress={() => loadInsights(true)}
                  className="bg-primary rounded-lg px-6 py-3"
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.text,
                      fontWeight: "600",
                    }}
                  >
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Insights Section */}
          {insights && insights.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 16,
                }}
              >
                Insights
              </Text>

              {insights.map((insight, index) => (
                <Card key={index} className="mb-4">
                  <View className="flex-row">
                    <Text style={{ fontSize: 24, marginRight: 12 }}>🧠</Text>
                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 16,
                          color: theme.textSecondary,
                          lineHeight: 24,
                        }}
                      >
                        {insight}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Challenge Section */}
          {challenge && (
            <View style={{ marginBottom: 32 }}>
              <Card
                className="border-2"
                style={{ borderColor: theme.primary }}
              >
                <View>
                  <View className="flex-row items-center mb-3">
                    <Text style={{ fontSize: 24, marginRight: 8 }}>🔥</Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: theme.text,
                      }}
                    >
                      Your Challenge This Week
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme.text,
                      lineHeight: 26,
                    }}
                  >
                    {challenge}
                  </Text>
                </View>
              </Card>
            </View>
          )}

          {/* Refresh Button */}
          <View style={{ marginTop: 16 }}>
            <Button
              title={refreshing ? "Refreshing..." : "Refresh Insights"}
              onPress={handleRefresh}
              disabled={refreshing}
              variant="secondary"
              loading={refreshing}
            />
          </View>
        </View>
      </ScrollView>
      <BottomNavBar navigation={navigation} currentRoute="WeeklyInsights" />
    </SafeAreaView>
  );
}

