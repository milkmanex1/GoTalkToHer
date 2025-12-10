import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";

// Situational openers data - matching ConversationStartersScreen structure
const SITUATIONAL_OPENERS = {
  Café: [
    {
      opener: "Is this seat taken? Mind if I join you? I'm [name].",
      tone: "Friendly and casual",
      dos: [
        "Read body language",
        "Be ready to leave if needed",
        "Start with small talk",
      ],
      donts: ["Force conversation", "Ignore social cues", "Be too forward"],
    },
  ],
  Gym: [
    {
      opener:
        "Hey, I see you're working on [exercise]. Any tips? I'm trying to improve my form.",
      tone: "Respectful and learning-oriented",
      dos: ["Wait for a natural break", "Be genuine", "Respect their workout"],
      donts: ["Interrupt mid-set", "Be overly chatty", "Make it about looks"],
    },
  ],
  Mall: [
    {
      opener:
        "Excuse me, do you know where I can find [store/item]? I'm a bit lost here.",
      tone: "Casual and friendly",
      dos: [
        "Be genuine in your question",
        "Smile and make eye contact",
        "Follow up naturally if they help",
      ],
      donts: [
        "Make it obvious you're hitting on them",
        "Be pushy",
        "Ignore their response",
      ],
    },
  ],
  Street: [
    {
      opener:
        "Excuse me, I couldn't help but notice [something specific and positive]. I had to come say hi.",
      tone: "Confident and respectful",
      dos: [
        "Be specific about what caught your attention",
        "Keep it brief and respectful",
        "Read their body language",
      ],
      donts: [
        "Be generic",
        "Block their path",
        "Make it about appearance only",
      ],
    },
  ],
  Bars: [
    {
      opener:
        "Hey, what are you drinking? I've been trying to decide what to order.",
      tone: "Casual and friendly",
      dos: ["Be approachable", "Keep it light and fun", "Respect their space"],
      donts: ["Be too loud", "Interrupt their group", "Be pushy"],
    },
  ],
  Bookstore: [
    {
      opener:
        "I see you're looking at [genre]. I love that section too. Any recommendations?",
      tone: "Shared interest",
      dos: [
        "Show genuine interest",
        "Ask follow-up questions",
        "Share your own favorites",
      ],
      donts: [
        "Pretend to know about books you don't",
        "Monopolize the conversation",
        "Be pushy",
      ],
    },
  ],
  Train: [
    {
      opener:
        "Hey, I noticed you're reading [book/magazine]. I've been meaning to check that out - is it good?",
      tone: "Curious and genuine",
      dos: [
        "Be genuinely interested",
        "Listen to their response",
        "Keep it light",
      ],
      donts: ["Overthink it", "Make it sound rehearsed", "Interrupt them"],
    },
  ],
};

// Mindset messages per situation
const MINDSET_MESSAGES = {
  Café: "Friendly curiosity beats pressure.",
  Gym: "Respect their space, show genuine interest.",
  Mall: "A simple question can open a conversation.",
  Street: "Confidence comes from taking action, not waiting for it.",
  Bars: "Keep it light and fun — energy is everything.",
  Bookstore: "Shared interests create natural connections.",
  Train: "A genuine question is always welcome.",
};

export default function SituationPrepScreen({ route, navigation }) {
  const { situation } = route.params || {};
  const situationData = SITUATIONAL_OPENERS[situation]?.[0];

  // Fallback if no opener found
  const opener =
    situationData?.opener ||
    "Couldn't load opener — just be friendly and confident.";
  const tip = situationData?.dos?.[0] || "Be genuine and respectful.";
  const mindset = MINDSET_MESSAGES[situation] || "You've got this.";

  const handleStartTimer = () => {
    navigation.navigate("ApproachTimer");
  };

  // Format situation name for display
  const getSituationDisplayName = () => {
    const names = {
      Café: "Café",
      Gym: "Gym",
      Mall: "Mall / Retail",
      Street: "Street",
      Bars: "Bars / Night Club",
      Bookstore: "Bookstore",
      Train: "Train / MRT",
    };
    return names[situation] || situation;
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
              Your {getSituationDisplayName()} Approach Plan
            </Text>
          </View>

          {/* Opener Card */}
          <Card className="mb-4">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#A0A0A0",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Suggested Opener
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#FFFFFF",
                lineHeight: 26,
              }}
            >
              {opener}
            </Text>
          </Card>

          {/* Tip Card */}
          <Card className="mb-4">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#A0A0A0",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Tip
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#FFFFFF",
                lineHeight: 24,
              }}
            >
              {tip}
            </Text>
            {situationData?.dos?.[1] && (
              <Text
                style={{
                  fontSize: 16,
                  color: "#FFFFFF",
                  lineHeight: 24,
                  marginTop: 8,
                }}
              >
                {situationData.dos[1]}
              </Text>
            )}
          </Card>

          {/* Mindset Card */}
          <Card className="mb-4">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#A0A0A0",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Mindset
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#FFFFFF",
                lineHeight: 24,
              }}
            >
              {mindset}
            </Text>
          </Card>

          {/* Action Cue Card */}
          <Card className="mb-8">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#A0A0A0",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Action Cue
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#A0A0A0",
                lineHeight: 24,
                fontStyle: "italic",
              }}
            >
              Take one breath. Smile. Walk over.
            </Text>
          </Card>

          {/* Start Timer Button */}
          <View className="w-full">
            <Button
              title="Approach Her"
              onPress={handleStartTimer}
              className="w-full"
            />
          </View>
        </View>
      </ScrollView>
      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} currentRoute="SituationPrep" />
    </SafeAreaView>
  );
}
