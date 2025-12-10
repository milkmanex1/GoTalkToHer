import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import BottomNavBar from "../components/BottomNavBar";

const SITUATIONS = [
  { id: "Café", label: "Café", icon: "☕" },
  { id: "Gym", label: "Gym", icon: "💪" },
  { id: "Mall", label: "Mall / Retail", icon: "🛍" },
  { id: "Street", label: "Street", icon: "🚶" },
  { id: "Bars", label: "Bars / Night Club", icon: "🍺" },
  { id: "Bookstore", label: "Bookstore", icon: "📚" },
  { id: "Train", label: "Train / MRT", icon: "🚇" },
];

export default function SituationSelectScreen({ navigation }) {
  const handleSelectSituation = (situation) => {
    navigation.navigate("SituationPrep", { situation });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
          {/* Header */}
          <View className="mb-8">
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: 8,
              }}
            >
              Where are you right now?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#A0A0A0",
                lineHeight: 22.4,
              }}
            >
              Choose the situation you're in
            </Text>
          </View>

          {/* Situation Cards */}
          {SITUATIONS.map((situation) => (
            <Card
              key={situation.id}
              onPress={() => handleSelectSituation(situation.id)}
              className="mb-4"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <Text style={{ fontSize: 28, marginRight: 16 }}>
                    {situation.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#FFFFFF",
                    }}
                  >
                    {situation.label}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: "#A0A0A0" }}>›</Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      {/* Bottom navigation bar */}
      <BottomNavBar
        navigation={navigation}
        currentRoute="SituationSelect"
      />
    </SafeAreaView>
  );
}

