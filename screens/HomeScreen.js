import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import { supabase } from "../lib/supabase";
import { TAGLINE_COMBOS } from "../constants/taglines";

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
      // Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        // No authenticated user, redirect to login
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
        // Profile doesn't exist, redirect to onboarding
        if (error.code === "PGRST116") {
          navigation.replace("Onboarding");
          return;
        }
        throw error;
      }

      if (!data) {
        // No profile found, redirect to onboarding
        navigation.replace("Onboarding");
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      // On error, redirect to login
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
      {/* Main centered hero block - vertically centered */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Large heart chat image */}
        <View
          className="mb-6"
          style={{ width: 200, height: 200, marginTop: 40 }}
        >
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
              color: "#f7f7f5",
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

      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} currentRoute="Home" />
    </SafeAreaView>
  );
}
