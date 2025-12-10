import React, { useState } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const insets = useSafeAreaInsets();

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

      // Generate AI feedback
      const feedback = await processPostActionReview(
        OUTCOMES.find((o) => o.id === selectedOutcome).label,
        notes,
        profile
      );

      setAiFeedback(feedback);

      // Save to database using user_id
      const { error } = await supabase.from("approach_events").insert([
        {
          user_id: profile.id,
          outcome: selectedOutcome,
          notes: JSON.stringify(notes),
          ai_feedback: feedback,
        },
      ]);

      if (error) throw error;

      // Update user profile stats and progress
      // Only count as approach if they actually approached (not "did_not_approach")
      if (selectedOutcome !== "did_not_approach") {
        await updateProgress(profile.id, "approach", selectedOutcome);
      }

      setSubmitted(true);
    } catch (error) {
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
    setSubmitted(false);
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

      const { error } = await supabase.from("approach_events").insert([
        {
          user_id: profile.id,
          outcome: selectedOutcome,
          notes: JSON.stringify(notes),
          ai_feedback: null, // No AI feedback for quick submit
        },
      ]);

      if (error) throw error;

      // Update user profile stats and progress
      // Only count as approach if they actually approached (not "did_not_approach")
      if (selectedOutcome !== "did_not_approach") {
        await updateProgress(profile.id, "approach", selectedOutcome);
      }

      // Show success and reset form
      Alert.alert("Success", "Review submitted successfully!", [
        {
          text: "OK",
          onPress: () => {
            handleReset();
          },
        },
      ]);
    } catch (error) {
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

  if (submitted && aiFeedback) {
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
              <Card
                className="mb-6"
                style={{
                  backgroundColor: theme.primaryRgba(0.1),
                  borderColor: theme.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    color: theme.primary,
                    marginBottom: 16,
                    textAlign: "center",
                    lineHeight: 33.8,
                  }}
                >
                  Great job taking action! 🎉
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: theme.text,
                    marginBottom: 12,
                  }}
                >
                  AI Feedback:
                </Text>
                <Text
                  style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}
                >
                  {aiFeedback}
                </Text>
              </Card>
              <Button
                title="Submit Another Review"
                onPress={handleReset}
                className="w-full"
              />
            </View>
          </ScrollView>
          {/* Bottom navigation bar */}
          <BottomNavBar
            navigation={navigation}
            currentRoute="PostActionReview"
          />
        </KeyboardAvoidingView>
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
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
                color: theme.primary,
                marginBottom: 24,
              }}
            >
              How did it go?
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
