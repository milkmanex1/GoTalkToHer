import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Timer from "../components/Timer";
import Button from "../components/Button";
import { Storage } from "../lib/storage";
import { supabase } from "../lib/supabase";

const DURATION = 15; // Fixed timer duration

export default function ApproachTimerScreen({ navigation }) {
  const [isActive, setIsActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [sound, setSound] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);

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

  return (
    <View className="flex-1 bg-background">
      {!isActive && !timerComplete && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-12">
            <Text style={{ fontSize: 22, fontWeight: '600', color: '#FFFFFF', marginBottom: 12, textAlign: 'center' }}>
              Ready to take action?
            </Text>
            <Text style={{ fontSize: 16, color: '#D0D0D0', textAlign: 'center', paddingHorizontal: 16, lineHeight: 22.4 }}>
              When you're ready, tap the button below. The timer will count
              down from {DURATION} seconds, and when it reaches zero, it's time to approach.
            </Text>
          </View>

          <View className="w-full px-6">
            <Button
              title="Start Timer"
              onPress={handleStart}
              className="w-full"
            />
          </View>
        </View>
      )}

      {isActive && (
        <View className="flex-1">
          {/* Large circular countdown centered vertically */}
          <View className="flex-1 items-center justify-center px-6">
            <Timer
              duration={DURATION}
              onComplete={handleComplete}
              isActive={isActive}
            />
            {/* Motivation text below = small + white */}
            <View className="mt-12 px-4">
              <Text style={{ fontSize: 14, color: '#FFFFFF', textAlign: 'center', lineHeight: 19.6 }}>
                Take a breath. Give yourself whatever excuses you need.
              </Text>
            </View>
          </View>
          
          {/* Cancel button at bottom - secondary style (outline pink) */}
          <View className="pb-5 px-6">
            <Button
              title="Cancel"
              onPress={handleReset}
              variant="secondary"
              className="w-full"
            />
          </View>
        </View>
      )}

      {timerComplete && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-12 items-center">
            <Text className="text-5xl mb-8">🎯</Text>
            {/* Large bold pink headline */}
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#FF4FA3', textAlign: 'center', marginBottom: 16, lineHeight: 46.8 }}>
              Go now.
            </Text>
            {/* Subtext in soft white */}
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', lineHeight: 28 }}>
              You've got this.
            </Text>
          </View>
          <View className="w-full px-6">
            <Button
              title="Start New Timer"
              onPress={handleReset}
              className="w-full"
            />
          </View>
        </View>
      )}
    </View>
  );
}
