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
      <View style={{ paddingHorizontal: 24, paddingVertical: 48 }}>
        {/* Large Title: 26-28 bold */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, textAlign: 'center', lineHeight: 36.4 }}>
          Welcome to Go Talk To Her
        </Text>
        {/* Body: 16-18 regular */}
        <Text style={{ fontSize: 16, color: '#D0D0D0', marginBottom: 48, textAlign: 'center', lineHeight: 22.4 }}>
          We're here to help you overcome approach anxiety and build confidence
          in real-world interactions. Let's get started!
        </Text>

        {/* Component spacing: 20-28 */}
        <View style={{ marginBottom: 24 }}>
          {/* Medium Title: 20-22 semi-bold */}
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}>
            Name / Nickname
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-xl px-4 py-3"
            style={{ fontSize: 16, color: '#FFFFFF' }}
            placeholder="Enter your name"
            placeholderTextColor="#A0A0A0"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}>
            Age Range
          </Text>
          <View className="bg-surface border border-border rounded-xl overflow-hidden">
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

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}>
            Confidence Level: {confidenceLevel}/10
          </Text>
          <View className="flex-row items-center justify-between">
            <Text style={{ fontSize: 13, color: '#A0A0A0' }}>Low</Text>
            <View className="flex-1 mx-4">
              <View className="flex-row">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <View
                    key={level}
                    onTouchEnd={() => setConfidenceLevel(level)}
                    className={`flex-1 h-10 mx-0.5 rounded-lg ${
                      level <= confidenceLevel ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </View>
            </View>
            <Text style={{ fontSize: 13, color: '#A0A0A0' }}>High</Text>
          </View>
        </View>

        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 }}>
            Biggest Challenge
          </Text>
          <View className="bg-surface border border-border rounded-xl overflow-hidden">
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
          className="w-full"
        />
      </View>
    </ScrollView>
  );
}
