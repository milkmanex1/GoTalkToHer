import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import Card from "../components/Card";
import BottomNavBar from "../components/BottomNavBar";

// Icon components
const CoffeeIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M10 2v2" />
    <Path d="M14 2v2" />
    <Path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
    <Path d="M6 2v2" />
  </Svg>
);

const DumbbellIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" />
    <Path d="m2.5 21.5 1.4-1.4" />
    <Path d="m20.1 3.9 1.4-1.4" />
    <Path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" />
    <Path d="m9.6 14.4 4.8-4.8" />
  </Svg>
);

const HandbagIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z" />
    <Path d="M8 11V6a4 4 0 0 1 8 0v5" />
  </Svg>
);

const FootprintsIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" />
    <Path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" />
    <Path d="M16 17h4" />
    <Path d="M4 13h4" />
  </Svg>
);

const BeerIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M17 11h1a3 3 0 0 1 0 6h-1" />
    <Path d="M9 12v6" />
    <Path d="M13 12v6" />
    <Path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z" />
    <Path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
  </Svg>
);

const LibraryIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect width="8" height="18" x="3" y="3" rx="1" />
    <Path d="M7 3v18" />
    <Path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" />
  </Svg>
);

const BusIcon = ({ color = "#FFFFFF", size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M8 6v6" />
    <Path d="M15 6v6" />
    <Path d="M2 12h19.6" />
    <Path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
    <Circle cx="7" cy="18" r="2" />
    <Path d="M9 18h5" />
    <Circle cx="16" cy="18" r="2" />
  </Svg>
);

const SITUATIONS = [
  { id: "Café", label: "Café", icon: CoffeeIcon },
  { id: "Gym", label: "Gym", icon: DumbbellIcon },
  { id: "Mall", label: "Mall / Retail", icon: HandbagIcon },
  { id: "Street", label: "Street", icon: FootprintsIcon },
  { id: "Bars", label: "Bars / Night Club", icon: BeerIcon },
  { id: "Bookstore", label: "Bookstore", icon: LibraryIcon },
  { id: "Train", label: "Bus / Train", icon: BusIcon },
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
          {SITUATIONS.map((situation) => {
            const IconComponent = situation.icon;
            return (
              <Card
                key={situation.id}
                onPress={() => handleSelectSituation(situation.id)}
                className="mb-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View style={{ marginRight: 16 }}>
                      <IconComponent color="#FFFFFF" size={28} />
                    </View>
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
            );
          })}
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

