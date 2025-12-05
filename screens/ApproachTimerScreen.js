import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
    <View className="flex-1 bg-background">
      {!isActive && !timerComplete && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-12 w-full">
            <Text className="text-base font-semibold text-textSecondary mb-3 text-center">
              Timer Duration
            </Text>
            <View className="bg-darkSurface border border-gray-800 rounded-xl overflow-hidden">
              <Picker
                selectedValue={duration}
                onValueChange={handleDurationChange}
                style={{ color: "#FFFFFF" }}
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

          <View className="mb-12">
            <Text className="text-2xl font-bold text-white mb-3 text-center">
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
        </View>
      )}

      {isActive && (
        <View className="flex-1">
          {/* Centered timer with reduced padding */}
          <View className="flex-1 items-center justify-center px-6">
            <Timer
              duration={duration}
              onComplete={handleComplete}
              isActive={isActive}
            />
            {/* Motivational text under circle */}
            <View className="mt-12 px-4">
              <Text className="text-base text-textSecondary text-center">
                Take a breath. Give yourself whatever excuses you need.
              </Text>
            </View>
          </View>
          
          {/* Cancel button at bottom */}
          <View className="pb-8 px-6">
            <TouchableOpacity
              onPress={handleReset}
              className="py-3 px-6 border border-primary rounded-full items-center"
            >
              <Text className="text-textSecondary font-semibold text-sm">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {timerComplete && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-12">
            <Text className="text-4xl mb-6">🎯</Text>
            <Text className="text-4xl font-bold text-primary text-center mb-4">
              Go now.
            </Text>
            <Text className="text-2xl font-semibold text-white text-center">
              You've got this.
            </Text>
          </View>
          <Button
            title="Start New Timer"
            onPress={handleReset}
            className="w-full"
          />
        </View>
      )}
    </View>
  );
}
