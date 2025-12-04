import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Timer from "../components/Timer";
import Button from "../components/Button";
import { Storage } from "../lib/storage";
import { supabase } from "../lib/supabase";

const DURATIONS = [10, 15, 20];

export default function ApproachTimerScreen({ navigation }) {
  const [duration, setDuration] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [sound, setSound] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);

  useEffect(() => {
    const loadDuration = async () => {
      const savedDuration = await Storage.getTimerDuration();
      setDuration(savedDuration);
    };
    loadDuration();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    try {
      // Sound is optional - app will work without it
      // You can add a notification.mp3 file to assets/ folder if desired
      // For now, we'll skip sound loading to avoid errors
    } catch (error) {
      console.log("Error loading sound:", error);
    }
  };

  const handleStart = async () => {
    await loadSound();
    setTimerStartedAt(new Date().toISOString());
    setIsActive(true);
    setTimerComplete(false);
  };

  const handleComplete = async () => {
    setIsActive(false);
    setTimerComplete(true);

    // Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Play sound (optional - skip if not available)
    // if (sound) {
    //   try {
    //     await sound.replayAsync();
    //   } catch (error) {
    //     console.log('Error playing sound:', error);
    //   }
    // }

    // Save timer event to Supabase
    try {
      const userId = await Storage.getUserId();
      if (userId) {
        await supabase.from("approach_events").insert([
          {
            user_id: userId,
            timer_started_at: timerStartedAt,
            timer_completed: true,
            outcome: "timer_completed",
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving timer event:", error);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimerComplete(false);
    setTimerStartedAt(null);
  };

  const handleDurationChange = async (newDuration) => {
    setDuration(newDuration);
    await Storage.setTimerDuration(newDuration);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-8 items-center">
        {!isActive && !timerComplete && (
          <>
            <View className="mb-8 w-full">
              <Text className="text-lg font-semibold text-text mb-4 text-center">
                Timer Duration
              </Text>
              <View className="bg-surface border border-gray-200 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={duration}
                  onValueChange={handleDurationChange}
                  style={{ color: "#1f2937" }}
                >
                  {DURATIONS.map((dur) => (
                    <Picker.Item
                      key={dur}
                      label={`${dur} seconds`}
                      value={dur}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-2xl font-bold text-text mb-4 text-center">
                Ready to take action?
              </Text>
              <Text className="text-base text-textSecondary text-center px-4">
                When you're ready, tap the button below. The timer will count
                down, and when it reaches zero, it's time to approach.
              </Text>
            </View>

            <Button
              title="Start Timer"
              onPress={handleStart}
              className="w-full"
            />
          </>
        )}

        {isActive && (
          <>
            <Timer
              duration={duration}
              onComplete={handleComplete}
              isActive={isActive}
            />
            <View className="mt-8 px-4">
              <Text className="text-xl text-text text-center mb-4">
                Take a breath. Give yourself whatever excuses you need.
              </Text>
              <Text className="text-xl font-bold text-primary text-center">
                When the timer ends, you approach.
              </Text>
            </View>
            <Button
              title="Cancel"
              onPress={handleReset}
              variant="outline"
              className="mt-8 w-full"
            />
          </>
        )}

        {timerComplete && (
          <>
            <View className="mb-8">
              <Text className="text-4xl mb-4">🎯</Text>
              <Text className="text-3xl font-bold text-primary text-center mb-4">
                Go now.
              </Text>
              <Text className="text-2xl font-semibold text-text text-center">
                You've got this.
              </Text>
            </View>
            <Button
              title="Start New Timer"
              onPress={handleReset}
              className="w-full"
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}
