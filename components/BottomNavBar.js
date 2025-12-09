import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";

// Icon components
const HomeIcon = ({ color = "#A0A0A0", size = 24 }) => (
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
    <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <Path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Svg>
);

const MessageCircleMoreIcon = ({ color = "#A0A0A0", size = 24 }) => (
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
    <Path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    <Path d="M8 12h.01" />
    <Path d="M12 12h.01" />
    <Path d="M16 12h.01" />
  </Svg>
);

const HeartIcon = ({ color = "#A0A0A0", size = 24 }) => (
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
    <Path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
  </Svg>
);

const UserIcon = ({ color = "#A0A0A0", size = 24 }) => (
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
    <Circle cx="12" cy="8" r="5" />
    <Path d="M20 21a8 8 0 0 0-16 0" />
  </Svg>
);

const NAV_ITEMS = [
  {
    id: "home",
    route: "Home",
    icon: HomeIcon,
    label: "Home",
  },
  {
    id: "starters",
    route: "ConversationStarters",
    icon: MessageCircleMoreIcon,
    label: "Starters",
  },
  {
    id: "chat",
    route: "WingmanChat",
    icon: HeartIcon,
    label: "Wingman",
  },
  {
    id: "profile",
    route: "Profile",
    icon: UserIcon,
    label: "Profile",
  },
];

export default function BottomNavBar({ navigation, currentRoute }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: insets.bottom + 4 }} className="px-2">
      <View className="flex-row justify-around items-center border-t border-border pt-2">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentRoute === item.route;
          const iconColor = isActive ? "#FF4FA3" : "#A0A0A0";
          const labelColor = isActive ? "#FF4FA3" : "#A0A0A0";

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate(item.route)}
              className="items-center flex-1"
            >
              <View className="mb-0.5">
                <IconComponent color={iconColor} size={24} />
              </View>
              <Text style={{ fontSize: 12, color: labelColor }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
