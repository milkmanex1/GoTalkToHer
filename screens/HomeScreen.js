import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import { TAGLINE_COMBOS } from "../constants/taglines";

export default function HomeScreen({ navigation }) {
  const { profile, session, ready, loading: authLoading } = useAuth();
  const [tagline, setTagline] = useState(TAGLINE_COMBOS[0]);

  useEffect(() => {
    // Randomly select a tagline combo on mount
    const randomIndex = Math.floor(Math.random() * TAGLINE_COMBOS.length);
    setTagline(TAGLINE_COMBOS[randomIndex]);
  }, []);

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

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      {/* Main centered hero block - vertically centered */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Large heart chat image */}
        <View
          className="mb-6"
          style={{ width: 250, height: 250, marginTop: 40 }}
        >
          <Image
            source={require("../assets/images/stopwatch_2.png")}
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

        {/* One BIG primary button: Start Situation Mode */}
        <View className="w-full px-6">
          <Button
            title="I wanna talk to her"
            onPress={() => navigation.navigate("SituationSelect")}
            className="w-full"
          />
        </View>
      </View>

      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} currentRoute="Home" />
    </SafeAreaView>
  );
}
