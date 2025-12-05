import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";
import { handleError } from "../lib/errorHandler";

const CHALLENGES = [
  "Fear of rejection",
  "Overthinking",
  "Awkwardness",
  "Not knowing what to say",
  "Lack of confidence",
  "Social anxiety",
];

const AGE_RANGES = ["18-22", "23-27", "28-32", "33-37", "38-42", "43+"];

export default function OnboardingScreen({ navigation }) {
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("23-27");
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [biggestChallenge, setBiggestChallenge] = useState(CHALLENGES[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .insert([
          {
            name: name.trim(),
            age_range: ageRange,
            confidence_level: confidenceLevel,
            biggest_challenge: biggestChallenge,
            fear_type: biggestChallenge,
            preferred_environments: [],
            past_successes: 0,
            past_rejections: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Save user ID to local storage
      await Storage.setUserId(data.id);

      navigation.replace("Home");
    } catch (error) {
      handleError(error, "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-12">
        <Text className="text-3xl font-bold text-text mb-4 text-center">
          Welcome to Go Talk To Her
        </Text>
        <Text className="text-base text-textSecondary mb-8 text-center">
          We're here to help you overcome approach anxiety and build confidence
          in real-world interactions. Let's get started!
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
            Name / Nickname
          </Text>
          <TextInput
            className="bg-surface border border-gray-200 rounded-xl px-4 py-3 text-base text-text"
            placeholder="Enter your name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
            Age Range
          </Text>
          <View className="bg-surface border border-gray-200 rounded-xl overflow-hidden">
            <Picker
              selectedValue={ageRange}
              onValueChange={setAgeRange}
              style={{ color: "#FFFFFF" }}
            >
              {AGE_RANGES.map((range) => (
                <Picker.Item key={range} label={range} value={range} />
              ))}
            </Picker>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
            Confidence Level: {confidenceLevel}/10
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Low</Text>
            <View className="flex-1 mx-4">
              <View className="flex-row">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <View
                    key={level}
                    onTouchEnd={() => setConfidenceLevel(level)}
                    className={`flex-1 h-10 mx-0.5 rounded-lg ${
                      level <= confidenceLevel ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                ))}
              </View>
            </View>
            <Text className="text-sm text-textSecondary">High</Text>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-lg font-semibold text-text mb-2">
            Biggest Challenge
          </Text>
          <View className="bg-surface border border-gray-200 rounded-xl overflow-hidden">
            <Picker
              selectedValue={biggestChallenge}
              onValueChange={setBiggestChallenge}
              style={{ color: "#FFFFFF" }}
            >
              {CHALLENGES.map((challenge) => (
                <Picker.Item
                  key={challenge}
                  label={challenge}
                  value={challenge}
                />
              ))}
            </Picker>
          </View>
        </View>

        <Button
          title={loading ? "Saving..." : "Get Started"}
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}
