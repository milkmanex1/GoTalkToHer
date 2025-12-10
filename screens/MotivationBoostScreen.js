import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import Button from "../components/Button";
import BottomNavBar from "../components/BottomNavBar";
import { supabase } from "../lib/supabase";
import { generateMotivationQuote } from "../lib/aiService";
import { handleError } from "../lib/errorHandler";
import { theme } from "../src/theme/colors";

const MOTIVATION_QUOTES = {
  "Action Beats Fear": [
    "The only way to overcome fear is to face it. Every small step counts.",
    "Courage isn't the absence of fear; it's acting despite it.",
    "You don't have to be perfect, you just have to start.",
    "The best time to take action was yesterday. The second best time is now.",
  ],
  "Rejection Resilience": [
    "Rejection is redirection. It's not about you, it's about compatibility.",
    "Every 'no' brings you closer to a 'yes'. Keep going.",
    "Rejection is protection - it saves you from wrong matches.",
    "Your worth isn't determined by someone else's response.",
  ],
  "Self-Worth": [
    "You are enough, exactly as you are. Believe it.",
    "Confidence comes from within. You have everything you need.",
    "Your value doesn't decrease based on someone's inability to see it.",
    "You're not trying to prove yourself - you're expressing yourself.",
  ],
  "Calm Breathing": [
    "Take a deep breath. You've got this. One moment at a time.",
    "Breathe in courage, breathe out fear. You're stronger than you think.",
    "Inhale confidence, exhale doubt. You're ready.",
    "Your breath is your anchor. Use it to ground yourself.",
  ],
};

export default function MotivationBoostScreen({ navigation }) {
  const [aiQuote, setAiQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuote = async () => {
    setLoading(true);
    try {
      // Get the authenticated user
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        Alert.alert("Error", "You must be logged in to generate quotes");
        return;
      }

      const userId = auth.user.id;

      // Load profile by id
      const { data: profile } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (!profile) {
        Alert.alert(
          "Error",
          "Profile not found. Please complete onboarding first."
        );
        navigation.replace("Onboarding");
        return;
      }

      const quote = await generateMotivationQuote(profile);
      setAiQuote(quote);
    } catch (error) {
      handleError(error, "Failed to generate quote. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
          <Button
            title={loading ? "Generating..." : "Give me a fresh quote"}
            onPress={handleGenerateQuote}
            disabled={loading}
            loading={loading}
            variant="primary"
            className="mb-6"
          />

          {aiQuote && (
            <Card
              className="mb-6"
              style={{
                backgroundColor: theme.primaryRgba(0.1),
                borderColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Your Personalized Quote
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.text,
                  fontStyle: "italic",
                  lineHeight: 22.4,
                }}
              >
                "{aiQuote}"
              </Text>
            </Card>
          )}

          {Object.entries(MOTIVATION_QUOTES).map(([category, quotes]) => (
            <View key={category} style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                {category}
              </Text>
              {quotes.map((quote, index) => (
                <Card key={index} className="mb-3">
                  <Text
                    style={{
                      fontSize: 16,
                      color: theme.text,
                      fontStyle: "italic",
                      lineHeight: 22.4,
                    }}
                  >
                    "{quote}"
                  </Text>
                </Card>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} currentRoute="MotivationBoost" />
    </SafeAreaView>
  );
}
