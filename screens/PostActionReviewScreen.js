import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";
import BottomNavBar from "../components/BottomNavBar";
import { supabase } from "../lib/supabase";
import { processPostActionReview } from "../lib/aiService";
import { handleError } from "../lib/errorHandler";
import { updateProgress } from "../lib/progress";
import { theme } from "../src/theme/colors";

const REVIEW_INTROS = [
  "Nice work showing up today. Walk me through it.",
  "Take a breath, king. Tell me what happened.",
  "Every rep counts. Let's reflect on this one.",
  "No pressure. Just share it honestly.",
  "Alright bro, let's break it down real quick.",
];

const OUTCOMES = [
  { id: "did_not_approach", label: "Did not approach" },
  { id: "not_interested", label: "Approached but she wasn't interested" },
  { id: "friendly", label: "She was friendly" },
  { id: "got_number", label: "Got her number" },
  { id: "conversation_no_number", label: "Had a conversation but no number" },
];

export default function PostActionReviewScreen({ navigation }) {
  const { profile, session, ready, loading: authLoading } = useAuth();
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [whatHappened, setWhatHappened] = useState("");
  const [howTheyFelt, setHowTheyFelt] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [introLine, setIntroLine] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Select random intro line on mount
    const randomIndex = Math.floor(Math.random() * REVIEW_INTROS.length);
    setIntroLine(REVIEW_INTROS[randomIndex]);
  }, []);

  const handleSubmit = async () => {
    if (!selectedOutcome) {
      Alert.alert("Error", "Please select an outcome");
      return;
    }

    if (!whatHappened.trim()) {
      Alert.alert("Error", "Please describe what happened");
      return;
    }

    if (!profile || !session) {
      Alert.alert("Error", "You must be logged in to submit a review");
      return;
    }

    setLoading(true);
    try {
      const notes = {
        whatHappened: whatHappened.trim(),
        howTheyFelt: howTheyFelt.trim(),
      };

      // Generate AI feedback with timeout protection
      let feedback;
      try {
        feedback = await Promise.race([
          processPostActionReview(
            OUTCOMES.find((o) => o.id === selectedOutcome).label,
            notes,
            profile
          ),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("AI feedback request timed out")),
              30000
            )
          ),
        ]);
      } catch (aiError) {
        console.error("Error generating AI feedback:", aiError);
        // Continue without AI feedback if it fails
        feedback = null;
      }

      setAiFeedback(feedback);

      // Save to database using user_id
      const { error: insertError } = await supabase
        .from("approach_events")
        .insert([
          {
            user_id: profile.id,
            outcome: selectedOutcome,
            notes: JSON.stringify(notes),
            ai_feedback: feedback,
          },
        ]);

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }

      // Update user profile stats and progress
      // Only count as approach if they actually approached (not "did_not_approach")
      if (selectedOutcome !== "did_not_approach") {
        try {
          await updateProgress(profile.id, "approach", selectedOutcome);
        } catch (progressError) {
          console.error("Error updating progress:", progressError);
          // Don't throw - progress update failure shouldn't block submission
        }
      }

      // Navigate to ReviewSubmitted screen instead of showing success card
      navigation.replace("ReviewSubmitted", {
        approached: selectedOutcome !== "did_not_approach",
        aiFeedback: feedback,
        outcome: selectedOutcome,
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      handleError(error, "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedOutcome(null);
    setWhatHappened("");
    setHowTheyFelt("");
    setAiFeedback(null);
  };

  const handleQuickSubmit = async () => {
    if (!selectedOutcome) {
      Alert.alert("Error", "Please select an outcome");
      return;
    }

    if (!profile || !session) {
      Alert.alert("Error", "You must be logged in to submit a review");
      return;
    }

    setLoading(true);
    try {
      // Save to database using user_id (without AI feedback)
      const notes = {
        whatHappened: whatHappened.trim() || "",
        howTheyFelt: howTheyFelt.trim() || "",
      };

      const { error: insertError } = await supabase
        .from("approach_events")
        .insert([
          {
            user_id: profile.id,
            outcome: selectedOutcome,
            notes: JSON.stringify(notes),
            ai_feedback: null, // No AI feedback for quick submit
          },
        ]);

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }

      // Update user profile stats and progress
      // Only count as approach if they actually approached (not "did_not_approach")
      if (selectedOutcome !== "did_not_approach") {
        try {
          await updateProgress(profile.id, "approach", selectedOutcome);
        } catch (progressError) {
          console.error("Error updating progress:", progressError);
          // Don't throw - progress update failure shouldn't block submission
        }
      }

      // Navigate to ReviewSubmitted screen (without AI feedback)
      navigation.replace("ReviewSubmitted", {
        approached: selectedOutcome !== "did_not_approach",
        aiFeedback: null,
        outcome: selectedOutcome,
      });
    } catch (error) {
      console.error("Error in handleQuickSubmit:", error);
      handleError(error, "Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready || authLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="text-textSecondary mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile || !session) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-textSecondary">Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal: 24, paddingVertical: 32 }}>
            {/* Rotating intro text */}
            {/* {introLine && (
              <Text
                style={{
                  fontSize: 20,
                  color: theme.primary,
                  marginBottom: 16,
                  lineHeight: 26,
                  fontWeight: "600",
                }}
              >
                {introLine}
              </Text>
            )} */}

            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: theme.primary,
                marginBottom: 24,
              }}
            >
              Bro, how did it go?
            </Text>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                Outcome
              </Text>
              {OUTCOMES.map((outcome) => (
                <TouchableOpacity
                  key={outcome.id}
                  onPress={() => setSelectedOutcome(outcome.id)}
                >
                  <Card
                    className={`mb-2 ${
                      selectedOutcome === outcome.id
                        ? "border-primary border-2"
                        : ""
                    }`}
                    style={
                      selectedOutcome === outcome.id
                        ? { backgroundColor: theme.primaryRgba(0.1) }
                        : {}
                    }
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight:
                          selectedOutcome === outcome.id ? "600" : "400",
                        color:
                          selectedOutcome === outcome.id
                            ? theme.primary
                            : theme.text,
                      }}
                    >
                      {outcome.label}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={loading ? "Submitting..." : "Submit Review"}
              onPress={handleQuickSubmit}
              disabled={loading}
              loading={loading}
              className="w-full mb-6"
            />

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                What happened?
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 min-h-[100px]"
                style={{
                  fontSize: 16,
                  color: theme.text,
                  textAlignVertical: "top",
                }}
                placeholder="Describe what happened..."
                placeholderTextColor={theme.textSecondary}
                value={whatHappened}
                onChangeText={setWhatHappened}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                How did you feel?
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 min-h-[100px]"
                style={{
                  fontSize: 16,
                  color: theme.text,
                  textAlignVertical: "top",
                }}
                placeholder="Share your feelings..."
                placeholderTextColor={theme.textSecondary}
                value={howTheyFelt}
                onChangeText={setHowTheyFelt}
                multiline
                textAlignVertical="top"
              />
            </View>

            <Button
              title={loading ? "Processing..." : "Get AI Feedback"}
              onPress={handleSubmit}
              disabled={loading}
              loading={loading}
              className="w-full"
            />
          </View>
        </ScrollView>
        {/* Bottom navigation bar */}
        <BottomNavBar navigation={navigation} currentRoute="PostActionReview" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
