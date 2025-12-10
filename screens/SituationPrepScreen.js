import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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
    {
      opener: "That looks really good! What did you order? I'm trying to decide what to get.",
      tone: "Curious and friendly",
      dos: [
        "Be genuine in your interest",
        "Use it as a conversation starter",
        "Keep it light",
      ],
      donts: ["Be pushy", "Make it about them only", "Overstay if they're busy"],
    },
    {
      opener: "Mind if I sit here? I love this spot. I'm [name], by the way.",
      tone: "Confident and approachable",
      dos: [
        "Be respectful of their space",
        "Introduce yourself naturally",
        "Read the situation",
      ],
      donts: ["Force it if they seem busy", "Be too forward", "Ignore social cues"],
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
    {
      opener: "Excuse me, do you know if this machine is free? Also, great form on those reps!",
      tone: "Polite and observant",
      dos: [
        "Wait for a break in their set",
        "Be genuine in your compliment",
        "Keep it brief",
      ],
      donts: ["Interrupt mid-set", "Be creepy", "Overstay"],
    },
    {
      opener: "Hey, I've been trying to master that exercise. Mind if I ask how you got so good at it?",
      tone: "Admiring and curious",
      dos: [
        "Show genuine interest",
        "Wait for appropriate timing",
        "Respect their workout time",
      ],
      donts: ["Interrupt", "Make it about appearance", "Be pushy"],
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
    {
      opener: "Hey, I noticed you're looking at [item]. I've been thinking about getting something similar. What do you think of it?",
      tone: "Friendly and curious",
      dos: [
        "Be genuine in your interest",
        "Use it as conversation starter",
        "Keep it light",
      ],
      donts: ["Be pushy", "Make it obvious", "Ignore their response"],
    },
    {
      opener: "Excuse me, do you work here? I'm looking for [item] and could use some help.",
      tone: "Polite and approachable",
      dos: [
        "Be respectful",
        "Use it as an opener",
        "Follow up naturally",
      ],
      donts: ["Be pushy", "Make it awkward", "Ignore social cues"],
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
    {
      opener: "Hey, I know this is random, but I saw you and thought you seemed interesting. I'm [name].",
      tone: "Direct and confident",
      dos: [
        "Be genuine",
        "Keep it brief",
        "Respect their response",
      ],
      donts: [
        "Be pushy",
        "Block their path",
        "Make it awkward",
      ],
    },
    {
      opener: "Excuse me, do you have the time? Thanks! Actually, I couldn't help but notice [something specific]. Mind if I say hi?",
      tone: "Polite and observant",
      dos: [
        "Be specific",
        "Keep it positive",
        "Respect their time",
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
    {
      opener: "Hey, I noticed you from across the room and thought you seemed cool. Mind if I join you? I'm [name].",
      tone: "Confident and friendly",
      dos: [
        "Be genuine",
        "Respect their group",
        "Keep it light",
      ],
      donts: ["Be pushy", "Interrupt", "Be too forward"],
    },
    {
      opener: "Excuse me, is this seat taken? I'm [name]. What brings you here tonight?",
      tone: "Approachable and curious",
      dos: [
        "Be respectful",
        "Show genuine interest",
        "Keep it fun",
      ],
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
    {
      opener: "Hey, I noticed you're checking out [book]. I've been meaning to read that! Is it any good?",
      tone: "Curious and genuine",
      dos: [
        "Be genuinely interested",
        "Listen to their response",
        "Share your own thoughts",
      ],
      donts: [
        "Pretend to know about it",
        "Be pushy",
        "Monopolize the conversation",
      ],
    },
    {
      opener: "Excuse me, do you work here? I'm looking for something in [genre] and could use some help.",
      tone: "Polite and approachable",
      dos: [
        "Be respectful",
        "Use it as conversation starter",
        "Show genuine interest",
      ],
      donts: [
        "Be pushy",
        "Pretend to need help",
        "Ignore their response",
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
    {
      opener: "Excuse me, is this seat taken? Mind if I sit here? I'm [name].",
      tone: "Polite and friendly",
      dos: [
        "Be respectful",
        "Read the situation",
        "Keep it natural",
      ],
      donts: [
        "Be pushy",
        "Ignore social cues",
        "Make it awkward",
      ],
    },
    {
      opener: "Hey, I couldn't help but notice [something specific]. I thought it was interesting. I'm [name].",
      tone: "Observant and friendly",
      dos: [
        "Be specific",
        "Keep it positive",
        "Respect their space",
      ],
      donts: [
        "Be generic",
        "Make it about appearance only",
        "Be pushy",
      ],
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
  const [currentOpenerIndex, setCurrentOpenerIndex] = useState(0);
  
  const openers = SITUATIONAL_OPENERS[situation] || [];
  const situationData = openers[currentOpenerIndex] || openers[0];

  // Fallback if no opener found
  const opener =
    situationData?.opener ||
    "Couldn't load opener — just be friendly and confident.";
  const tip = situationData?.dos?.[0] || "Be genuine and respectful.";
  const mindset = MINDSET_MESSAGES[situation] || "You've got this.";

  const handleNextOpener = () => {
    if (openers.length > 0) {
      setCurrentOpenerIndex((prev) => (prev + 1) % openers.length);
    }
  };

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
              Suggested Opener {openers.length > 1 ? `(${currentOpenerIndex + 1}/${openers.length})` : ""}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#FFFFFF",
                lineHeight: 26,
                marginBottom: openers.length > 1 ? 12 : 0,
              }}
            >
              {opener}
            </Text>
            {openers.length > 1 && (
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity
                  onPress={handleNextOpener}
                  style={{
                    backgroundColor: "#FF4FA3",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    Next →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
