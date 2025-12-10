import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import { theme } from "../src/theme/colors";

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
      opener: "That looks good! What are you having? I'm still deciding.",
      tone: "Casual and curious",
      dos: ["Be genuinely interested", "Keep it light", "Follow up naturally"],
      donts: ["Be pushy", "Make it awkward", "Overstay your welcome"],
    },
    {
      opener: "Mind if I sit here? I'm waiting for a friend.",
      tone: "Polite and non-threatening",
      dos: ["Be respectful", "Read the room", "Start conversation naturally"],
      donts: ["Force it", "Ignore signals", "Be too forward"],
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
      opener: "That's an impressive set. How long have you been training?",
      tone: "Appreciative and curious",
      dos: [
        "Wait for them to finish",
        "Show genuine interest",
        "Keep it brief",
      ],
      donts: ["Interrupt", "Be pushy", "Make it about appearance"],
    },
    {
      opener: "Excuse me, are you using this? Mind if I work in?",
      tone: "Polite and respectful",
      dos: ["Be considerate", "Respect their space", "Keep it professional"],
      donts: ["Be pushy", "Make it awkward", "Overstay"],
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
      opener: "That's a nice [item]. Where did you get it?",
      tone: "Complimentary and curious",
      dos: ["Be specific", "Show genuine interest", "Keep it light"],
      donts: ["Be generic", "Be pushy", "Make it awkward"],
    },
    {
      opener: "Excuse me, do you work here? I'm looking for [item].",
      tone: "Polite and direct",
      dos: ["Be respectful", "Read the situation", "Follow up naturally"],
      donts: ["Be pushy", "Ignore signals", "Make it obvious"],
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
      opener: "Hey, I know this is random, but I had to say hi. I'm [name].",
      tone: "Direct and friendly",
      dos: ["Be confident", "Keep it brief", "Respect their response"],
      donts: ["Be pushy", "Block their way", "Make it awkward"],
    },
    {
      opener:
        "Excuse me, do you have a minute? I noticed [something specific].",
      tone: "Polite and observant",
      dos: ["Be specific", "Respect their time", "Read body language"],
      donts: ["Be generic", "Be pushy", "Ignore signals"],
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
      opener: "Is this seat taken? Mind if I join you?",
      tone: "Friendly and casual",
      dos: ["Read the room", "Be ready to leave if needed", "Keep it fun"],
      donts: ["Be pushy", "Interrupt", "Be too forward"],
    },
    {
      opener:
        "Hey, I couldn't help but notice you. I'm [name]. What brings you here?",
      tone: "Confident and curious",
      dos: ["Be genuine", "Keep it light", "Respect their space"],
      donts: ["Be too loud", "Be pushy", "Ignore signals"],
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
      opener: "That's a great book! Have you read it yet?",
      tone: "Curious and friendly",
      dos: ["Show genuine interest", "Ask follow-ups", "Share your thoughts"],
      donts: ["Pretend to know it", "Be pushy", "Monopolize"],
    },
    {
      opener:
        "Excuse me, do you know if they have [book]? I've been looking for it.",
      tone: "Polite and curious",
      dos: ["Be genuine", "Show interest", "Follow up naturally"],
      donts: ["Be pushy", "Ignore signals", "Make it awkward"],
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
      opener: "Is this seat taken? Mind if I sit here?",
      tone: "Polite and friendly",
      dos: [
        "Be respectful",
        "Read the situation",
        "Start conversation naturally",
      ],
      donts: ["Be pushy", "Ignore signals", "Make it awkward"],
    },
    {
      opener: "Excuse me, do you know what stop we're at? I'm a bit lost.",
      tone: "Polite and casual",
      dos: ["Be genuine", "Show appreciation", "Follow up naturally"],
      donts: ["Be pushy", "Ignore signals", "Make it obvious"],
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
  const allOpeners = SITUATIONAL_OPENERS[situation] || [];
  const [currentOpenerIndex, setCurrentOpenerIndex] = useState(0);
  const [tipExpanded, setTipExpanded] = useState(false);
  const [mindsetExpanded, setMindsetExpanded] = useState(false);
  const [actionCueExpanded, setActionCueExpanded] = useState(false);

  // Get current opener data
  const currentOpenerData = allOpeners[currentOpenerIndex] || allOpeners[0];

  // Fallback if no opener found
  const opener =
    currentOpenerData?.opener ||
    "Couldn't load opener — just be friendly and confident.";
  const tip = currentOpenerData?.dos?.[0] || "Be genuine and respectful.";
  const mindset =
    currentOpenerData?.tone ||
    MINDSET_MESSAGES[situation] ||
    "You've got this.";

  const handleNextOpener = () => {
    const nextIndex = (currentOpenerIndex + 1) % allOpeners.length;
    setCurrentOpenerIndex(nextIndex);
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
          {/* Header */}
          <View className="mb-4">
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 4,
              }}
            >
              Your {getSituationDisplayName()} Approach Plan
            </Text>
          </View>

          {/* Opener Card */}
          <Card className="mb-3">
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.textSecondary,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Suggested Opener {currentOpenerIndex + 1}/{allOpeners.length}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: theme.text,
                  lineHeight: 26,
                  marginBottom: allOpeners.length > 1 ? 12 : 0,
                }}
              >
                {opener}
              </Text>
              {allOpeners.length > 1 && (
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={handleNextOpener}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: theme.primaryRgba(0.1),
                      borderWidth: 1,
                      borderColor: theme.primary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: theme.primary,
                      }}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Card>

          {/* Tip Card */}
          <Card className="mb-3">
            <TouchableOpacity
              onPress={() => setTipExpanded(!tipExpanded)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Tip
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textSecondary,
                  fontWeight: "600",
                }}
              >
                {tipExpanded ? "−" : "+"}
              </Text>
            </TouchableOpacity>
            {tipExpanded && (
              <View style={{ marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.text,
                    lineHeight: 24,
                  }}
                >
                  {tip}
                </Text>
                {currentOpenerData?.dos?.[1] && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.text,
                      lineHeight: 24,
                      marginTop: 8,
                    }}
                  >
                    {currentOpenerData.dos[1]}
                  </Text>
                )}
              </View>
            )}
          </Card>

          {/* Mindset Card */}
          <Card className="mb-3">
            <TouchableOpacity
              onPress={() => setMindsetExpanded(!mindsetExpanded)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Mindset
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textSecondary,
                  fontWeight: "600",
                }}
              >
                {mindsetExpanded ? "−" : "+"}
              </Text>
            </TouchableOpacity>
            {mindsetExpanded && (
              <View style={{ marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.text,
                    lineHeight: 24,
                  }}
                >
                  {mindset}
                </Text>
              </View>
            )}
          </Card>

          {/* Action Cue Card */}
          <Card className="mb-4">
            <TouchableOpacity
              onPress={() => setActionCueExpanded(!actionCueExpanded)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: theme.textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Action Cue
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textSecondary,
                  fontWeight: "600",
                }}
              >
                {actionCueExpanded ? "−" : "+"}
              </Text>
            </TouchableOpacity>
            {actionCueExpanded && (
              <View style={{ marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.textSecondary,
                    lineHeight: 24,
                    fontStyle: "italic",
                  }}
                >
                  Take one breath. Smile. Walk over.
                </Text>
              </View>
            )}
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
