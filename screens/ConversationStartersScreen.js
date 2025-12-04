import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Card from "../components/Card";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import { generateConversationStarter } from "../lib/aiService";
import { handleError } from "../lib/errorHandler";

const CONVERSATION_STARTERS = {
  "Friendly Openers": [
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
      opener:
        "Excuse me, do you have the time? Thanks! Actually, I couldn't help but notice [something specific and positive].",
      tone: "Polite and observant",
      dos: ["Be specific", "Keep it positive", "Smile"],
      donts: ["Be generic", "Make it about appearance only", "Rush"],
    },
  ],
  "Situational Openers": {
    Gym: [
      {
        opener:
          "Hey, I see you're working on [exercise]. Any tips? I'm trying to improve my form.",
        tone: "Respectful and learning-oriented",
        dos: [
          "Wait for a natural break",
          "Be genuine",
          "Respect their workout",
        ],
        donts: ["Interrupt mid-set", "Be overly chatty", "Make it about looks"],
      },
    ],
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
  },
  Compliments: [
    {
      opener:
        "I just wanted to say, I really like your [specific item - not body]. Where did you get it?",
      tone: "Appreciative and specific",
      dos: ["Be specific", "Focus on choices, not body", "Be genuine"],
      donts: [
        "Be generic",
        "Make it about appearance",
        "Expect anything in return",
      ],
    },
  ],
  "Low-Pressure Comments": [
    {
      opener: "Nice weather today, isn't it?",
      tone: "Casual and easy",
      dos: ["Use as icebreaker", "Follow up naturally", "Keep it light"],
      donts: ["Overthink it", "Make it awkward", "Force conversation"],
    },
    {
      opener: "This line is taking forever, right?",
      tone: "Relatable and shared experience",
      dos: ["Use shared context", "Keep it brief", "See if they engage"],
      donts: ["Complain too much", "Be negative", "Overstay"],
    },
  ],
};

export default function ConversationStartersScreen({ navigation }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedStarter, setExpandedStarter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(null);

  const handleGeneratePersonalized = async () => {
    setLoading(true);
    try {
      const userId = await Storage.getUserId();
      if (!userId) {
        Alert.alert("Error", "Please complete onboarding first");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (!profile) {
        Alert.alert("Error", "Profile not found");
        return;
      }

      const generated = await generateConversationStarter(profile, "general");
      setAiGenerated(generated);
    } catch (error) {
      handleError(
        error,
        "Failed to generate personalized opener. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-8">
        <Button
          title={loading ? "Generating..." : "Generate Personalized Opener"}
          onPress={handleGeneratePersonalized}
          disabled={loading}
          loading={loading}
          variant="secondary"
          className="mb-6"
        />

        {aiGenerated && (
          <Card className="mb-6 bg-secondary/10 border-secondary">
            <Text className="text-lg font-semibold text-text mb-2">
              AI-Generated Opener
            </Text>
            <Text className="text-base text-text">{aiGenerated}</Text>
          </Card>
        )}

        {Object.entries(CONVERSATION_STARTERS).map(([category, items]) => (
          <View key={category} className="mb-6">
            <TouchableOpacity
              onPress={() =>
                setExpandedCategory(
                  expandedCategory === category ? null : category
                )
              }
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-semibold text-text">
                    {category}
                  </Text>
                  <Text className="text-2xl">
                    {expandedCategory === category ? "▼" : "▶"}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>

            {expandedCategory === category && (
              <View className="mt-2 ml-4">
                {Array.isArray(items)
                  ? items.map((starter, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          setExpandedStarter(
                            expandedStarter === `${category}-${index}`
                              ? null
                              : `${category}-${index}`
                          )
                        }
                      >
                        <Card className="mb-2">
                          <Text className="text-base font-medium text-text mb-1">
                            "{starter.opener}"
                          </Text>
                          <Text className="text-sm text-textSecondary">
                            Tap to see details →
                          </Text>
                          {expandedStarter === `${category}-${index}` && (
                            <View className="mt-4">
                              <Text className="text-sm font-semibold text-text mb-1">
                                Tone: {starter.tone}
                              </Text>
                              <Text className="text-sm font-semibold text-text mb-1 mt-2">
                                Do's:
                              </Text>
                              {starter.dos.map((doItem, i) => (
                                <Text
                                  key={i}
                                  className="text-sm text-textSecondary ml-2"
                                >
                                  • {doItem}
                                </Text>
                              ))}
                              <Text className="text-sm font-semibold text-text mb-1 mt-2">
                                Don'ts:
                              </Text>
                              {starter.donts.map((dont, i) => (
                                <Text
                                  key={i}
                                  className="text-sm text-textSecondary ml-2"
                                >
                                  • {dont}
                                </Text>
                              ))}
                            </View>
                          )}
                        </Card>
                      </TouchableOpacity>
                    ))
                  : Object.entries(items).map(([env, envStarters]) => (
                      <View key={env} className="mb-4">
                        <Text className="text-lg font-semibold text-text mb-2">
                          {env}
                        </Text>
                        {envStarters.map((starter, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() =>
                              setExpandedStarter(
                                expandedStarter ===
                                  `${category}-${env}-${index}`
                                  ? null
                                  : `${category}-${env}-${index}`
                              )
                            }
                          >
                            <Card className="mb-2">
                              <Text className="text-base font-medium text-text mb-1">
                                "{starter.opener}"
                              </Text>
                              <Text className="text-sm text-textSecondary">
                                Tap to see details →
                              </Text>
                              {expandedStarter ===
                                `${category}-${env}-${index}` && (
                                <View className="mt-4">
                                  <Text className="text-sm font-semibold text-text mb-1">
                                    Tone: {starter.tone}
                                  </Text>
                                  <Text className="text-sm font-semibold text-text mb-1 mt-2">
                                    Do's:
                                  </Text>
                                  {starter.dos.map((doItem, i) => (
                                    <Text
                                      key={i}
                                      className="text-sm text-textSecondary ml-2"
                                    >
                                      • {doItem}
                                    </Text>
                                  ))}
                                  <Text className="text-sm font-semibold text-text mb-1 mt-2">
                                    Don'ts:
                                  </Text>
                                  {starter.donts.map((dont, i) => (
                                    <Text
                                      key={i}
                                      className="text-sm text-textSecondary ml-2"
                                    >
                                      • {dont}
                                    </Text>
                                  ))}
                                </View>
                              )}
                            </Card>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
