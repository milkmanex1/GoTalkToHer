import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import { TAGLINE_COMBOS } from "../constants/taglines";
import { theme } from "../src/theme/colors";

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
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="text-textSecondary mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      {/* Main centered hero block - vertically centered */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Large heart chat image - marginTop controls image vert position*/}
        <View style={{ width: 260, height: 260, marginTop: 40 }}>
          <Image
            source={require("../assets/images/stopwatch_5_photoroom.png")}
            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
          />
        </View>

        {/* Large headline: Random tagline (pink) marginBot controls the button position */}
        <View
          className="items-center"
          style={{ marginTop: 0, marginBottom: 30 }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: theme.text,
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
              color: theme.textSecondary,
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
