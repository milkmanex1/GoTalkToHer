import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAV_ITEMS = [
  {
    id: "home",
    route: "Home",
    icon: "⏱️",
    label: "Timer",
  },
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

export default function BottomNavBar({ navigation, currentRoute }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: insets.bottom + 8 }} className="px-2">
      <View className="flex-row justify-around items-center border-t border-border pt-5">
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => navigation.navigate(item.route)}
            className="items-center flex-1"
          >
            <Text className="text-2xl mb-1">{item.icon}</Text>
            <Text style={{ fontSize: 12, color: "#A0A0A0" }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

