import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import { TAGLINE_COMBOS } from "../constants/taglines";

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
  const [tagline, setTagline] = useState(TAGLINE_COMBOS[0]);

  useEffect(() => {
    loadUserProfile();
    // Randomly select a tagline combo on mount
    const randomIndex = Math.floor(Math.random() * TAGLINE_COMBOS.length);
    setTagline(TAGLINE_COMBOS[randomIndex]);
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
      {/* Main centered hero block - vertically centered */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Large heart chat image */}
        <View className="mb-6" style={{ width: 200, height: 200 }}>
          <Image
            source={require("../assets/images/heart_chat.png")}
            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
          />
        </View>

        {/* Large headline: Random tagline (pink) */}
        <View className="items-center mb-12">
          <Text
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#FF4FA3",
              textAlign: "center",
              lineHeight: 46.8,
            }}
          >
            {tagline.headline}
          </Text>
          {/* Subtitle: Random subtext (white/grey) */}
          <Text
            style={{
              fontSize: 18,
              color: "#D0D0D0",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 25.2,
            }}
          >
            {tagline.subtext}
          </Text>
        </View>

        {/* One BIG primary button: Start Approach Timer */}
        <View className="w-full px-6">
          <Button
            title="Start Approach Timer"
            onPress={() => navigation.navigate("ApproachTimer")}
            className="w-full"
          />
        </View>
      </View>

      {/* Secondary features as bottom icon bar */}
      <View className="pb-5 px-6">
        <View className="flex-row justify-around items-center border-t border-border pt-5">
          {SECONDARY_FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              onPress={() => navigation.navigate(feature.route)}
              className="items-center flex-1"
            >
              <Text className="text-2xl mb-1">{feature.icon}</Text>
              <Text style={{ fontSize: 12, color: "#A0A0A0" }}>
                {feature.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
