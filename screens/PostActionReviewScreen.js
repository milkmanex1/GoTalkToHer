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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import Card from "../components/Card";
import BottomNavBar from "../components/BottomNavBar";
import { supabase } from "../lib/supabase";
import { processPostActionReview } from "../lib/aiService";
import { handleError } from "../lib/errorHandler";
import { updateProgress } from "../lib/progress";

const OUTCOMES = [
  { id: "did_not_approach", label: "Did not approach" },
  { id: "not_interested", label: "Approached but she wasn't interested" },
  { id: "friendly", label: "She was friendly" },
  { id: "got_number", label: "Got her number" },
  { id: "conversation_no_number", label: "Had a conversation but no number" },
];

export default function PostActionReviewScreen({ navigation }) {
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

    setLoading(true);
    try {
      // Get the authenticated user
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth?.user) {
        Alert.alert("Error", "You must be logged in to submit a review");
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
          user_id: userId,
          outcome: selectedOutcome,
          notes: JSON.stringify(notes),
          ai_feedback: feedback,
        },
      ]);

      if (error) throw error;

      // Update user profile stats and progress
      // Only count as approach if they actually approached (not "did_not_approach")
      if (selectedOutcome !== "did_not_approach") {
        await updateProgress(userId, "approach", selectedOutcome);
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

  if (submitted && aiFeedback) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0E0F12" }} edges={[]}>
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
                  backgroundColor: "rgba(255, 79, 163, 0.1)",
                  borderColor: "#FF4FA3",
                }}
              >
                <Text
                  style={{
                    fontSize: 26,
                    fontWeight: "bold",
                    color: "#FF4FA3",
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
                    color: "#FFFFFF",
                    marginBottom: 12,
                  }}
                >
                  AI Feedback:
                </Text>
                <Text
                  style={{ fontSize: 16, color: "#FFFFFF", lineHeight: 22.4 }}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0E0F12" }} edges={[]}>
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
                color: "#FF4FA3",
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
                  color: "#FFFFFF",
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
                        ? { backgroundColor: "rgba(255, 79, 163, 0.1)" }
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
                            ? "#FF4FA3"
                            : "#FFFFFF",
                      }}
                    >
                      {outcome.label}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginBottom: 12,
                }}
              >
                What happened?
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 min-h-[100px]"
                style={{
                  fontSize: 16,
                  color: "#FFFFFF",
                  textAlignVertical: "top",
                }}
                placeholder="Describe what happened..."
                placeholderTextColor="#A0A0A0"
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
                  color: "#FFFFFF",
                  marginBottom: 12,
                }}
              >
                How did you feel?
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3 min-h-[100px]"
                style={{
                  fontSize: 16,
                  color: "#FFFFFF",
                  textAlignVertical: "top",
                }}
                placeholder="Share your feelings..."
                placeholderTextColor="#A0A0A0"
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
