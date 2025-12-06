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
      // Get the authenticated user
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        Alert.alert("Error", "You must be logged in to generate openers");
        return;
      }

      const authUserId = auth.user.id;

      // Load profile by auth_user_id
      const { data: profile } = await supabase
        .from("user_profile")
        .select("*")
        .eq("auth_user_id", authUserId)
        .single();

      if (!profile) {
        Alert.alert("Error", "Profile not found. Please complete onboarding first.");
        navigation.replace("Onboarding");
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
      <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <Button
          title={loading ? "Generating..." : "Generate Personalized Opener"}
          onPress={handleGeneratePersonalized}
          disabled={loading}
          loading={loading}
          variant="secondary"
          className="mb-6"
        />

        {aiGenerated && (
          <Card className="mb-6" style={{ backgroundColor: 'rgba(255, 79, 163, 0.1)', borderColor: '#FF4FA3' }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}>
              AI-Generated Opener
            </Text>
            <Text style={{ fontSize: 16, color: '#FFFFFF', lineHeight: 22.4 }}>{aiGenerated}</Text>
          </Card>
        )}

        {Object.entries(CONVERSATION_STARTERS).map(([category, items]) => (
          <View key={category} style={{ marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() =>
                setExpandedCategory(
                  expandedCategory === category ? null : category
                )
              }
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <Text style={{ fontSize: 22, fontWeight: '600', color: '#FFFFFF' }}>
                    {category}
                  </Text>
                  <Text style={{ fontSize: 18, color: '#FFFFFF' }}>
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
                          <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF', marginBottom: 8 }}>
                            "{starter.opener}"
                          </Text>
                          <Text style={{ fontSize: 13, color: '#A0A0A0' }}>
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
