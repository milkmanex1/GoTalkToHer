import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";

const SECONDARY_FEATURES = [
  {
    id: "starters",
    route: "ConversationStarters",
    icon: "💬",
    label: "Starters",
  },
  {
    id: "motivation",
    route: "MotivationBoost",
    icon: "💪",
    label: "Motivation",
  },
  {
    id: "review",
    route: "PostActionReview",
    icon: "📝",
    label: "Review",
  },
  {
    id: "chat",
    route: "WingmanChat",
    icon: "🤖",
    label: "Wingman",
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
    <View className="flex-1 bg-background">
      {/* Main centered content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon/Illustration placeholder */}
        <View className="mb-12">
          <Text className="text-6xl">⏱️</Text>
        </View>

        {/* Motivational header */}
        <View className="items-center mb-16">
          <Text className="text-5xl font-bold text-white mb-4 text-center">
            Go Now.
          </Text>
          <Text className="text-xl text-textSecondary text-center">
            You've got this.
          </Text>
        </View>

        {/* Single giant action button */}
        <Button
          title="Start Approach Timer"
          onPress={() => navigation.navigate("ApproachTimer")}
          className="w-full mb-20"
        />
      </View>

      {/* Secondary links as bottom icon bar */}
      <View className="pb-8 px-6">
        <View className="flex-row justify-around items-center border-t border-gray-800 pt-6">
          {SECONDARY_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              onPress={() => navigation.navigate(feature.route)}
              className="items-center flex-1"
            >
              <Text className="text-2xl mb-1">{feature.icon}</Text>
              <Text className="text-xs text-textSecondary">{feature.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
