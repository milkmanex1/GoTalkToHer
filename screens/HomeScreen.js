import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";

const FEATURES = [
  {
    id: "timer",
    title: "Approach Timer",
    description: "Countdown timer to help you take action",
    route: "ApproachTimer",
    icon: "⏱️",
  },
  {
    id: "starters",
    title: "Conversation Starters",
    description: "Get ideas for natural, respectful openers",
    route: "ConversationStarters",
    icon: "💬",
  },
  {
    id: "motivation",
    title: "Motivation Boost",
    description: "Get inspired with encouraging quotes",
    route: "MotivationBoost",
    icon: "💪",
  },
  {
    id: "review",
    title: "Post-Action Review",
    description: "Reflect on your experience and get AI feedback",
    route: "PostActionReview",
    icon: "📝",
  },
  {
    id: "chat",
    title: "Wingman AI Chat",
    description: "Get personalized coaching and advice",
    route: "WingmanChat",
    icon: "🤖",
  },
];

export default function HomeScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userId = await Storage.getUserId();
      if (!userId) {
        navigation.replace("Onboarding");
        return;
      }

      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-textSecondary">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-8">
        {userProfile && (
          <View className="mb-6">
            <Text className="text-2xl font-bold text-text mb-2">
              Welcome back, {userProfile.name}! 👋
            </Text>
            <Text className="text-base text-textSecondary">
              Ready to build your confidence today?
            </Text>
          </View>
        )}

        <View>
          {FEATURES.map((feature) => (
            <Card
              key={feature.id}
              onPress={() => navigation.navigate(feature.route)}
              className="mb-4"
            >
              <View className="flex-row items-center">
                <Text className="text-4xl mr-4">{feature.icon}</Text>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-text mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-textSecondary">
                    {feature.description}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
