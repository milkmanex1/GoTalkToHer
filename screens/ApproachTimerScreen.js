import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Timer from "../components/Timer";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { updateProgress } from "../lib/progress";
import { Storage } from "../lib/storage";
import { theme } from "../src/theme/colors";

const { width, height } = Dimensions.get("window");

const MOTIVATIONAL_MESSAGES = [
  "Go even if you're not ready.",
  "Go while afraid.",
  "Do it scared.",
  "Lead with your feet.",
  "Don't wait. Move.",
  "Trust yourself. Just move.",
  "This is how confidence is built.",
  "One moment of courage. That's all.",
  "You've got this",
  "You’re not supposed to feel ready. Just steady.",
];

const TIMER_COUNTDOWN_MESSAGES = [
  "Fear is normal. It means you're alive.",
  "It's okay to feel nervous. Anyone would.",
  "You're allowed to feel scared and still be strong.",
  "Courage doesn't feel calm. It feels like this.",
  "You don't have to fight the fear. Just let it be.",
  "This is what growth feels like—shaky, a little scary, but human.",
  "Your fear is not a problem. It's part of the process.",
  "This tension means you're growing.",
  "It's okay to feel this way. Really.",
  "Breathe… you're doing better than you think.",
  "You're not alone. So many feel exactly like this.",
  "Give yourself a little grace. This is hard.",
  "You're braver than you think.",
];

export default function ApproachTimerScreen({ navigation }) {
  const { profile, session } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [sound, setSound] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [timerDuration, setTimerDuration] = useState(10); // Default to 10 seconds
  const [remainingTime, setRemainingTime] = useState(10);
  const [motivationalMessage, setMotivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[0]
  );
  const [countdownMessage, setCountdownMessage] = useState(
    TIMER_COUNTDOWN_MESSAGES[0]
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bottomTextOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Load timer duration from storage
  const loadTimerDuration = useCallback(async () => {
    try {
      const duration = await Storage.getTimerDuration();
      setTimerDuration(duration);
      // Only update remainingTime if timer is not active
      if (!isActive) {
        setRemainingTime(duration);
      }
    } catch (error) {
      console.error("Error loading timer duration:", error);
    }
  }, [isActive]);

  // Load duration on mount and when screen is focused
  useEffect(() => {
    loadTimerDuration();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTimerDuration();
    }, [loadTimerDuration])
  );

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
    setRemainingTime(timerDuration);
    // Randomly select a countdown message
    const randomIndex = Math.floor(
      Math.random() * TIMER_COUNTDOWN_MESSAGES.length
    );
    setCountdownMessage(TIMER_COUNTDOWN_MESSAGES[randomIndex]);
    // Fade in bottom text
    Animated.timing(bottomTextOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleTimerUpdate = (time) => {
    setRemainingTime(time);
    // Flash effect for last 3 seconds
    if (time <= 3 && time > 0) {
      const flash = Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.25,
          duration: 35,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 35,
          useNativeDriver: true,
        }),
      ]);
      flash.start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleComplete = async () => {
    setIsActive(false);

    // Randomly select a motivational message
    const randomIndex = Math.floor(
      Math.random() * MOTIVATIONAL_MESSAGES.length
    );
    setMotivationalMessage(MOTIVATIONAL_MESSAGES[randomIndex]);

    // Smooth fade transition
    fadeAnim.setValue(0);
    setTimerComplete(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

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

    // Save timer event to Supabase and update progress
    try {
      if (profile?.id && session) {
        await supabase.from("approach_events").insert([
          {
            user_id: profile.id,
            timer_started_at: timerStartedAt,
            timer_completed: true,
            outcome: "timer_completed",
          },
        ]);

        // Update progress stats
        await updateProgress(profile.id, "timer", "timer_completed");
      }
    } catch (error) {
      console.error("Error saving timer event:", error);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimerComplete(false);
    setTimerStartedAt(null);
    setRemainingTime(timerDuration);
    fadeAnim.setValue(0);
    bottomTextOpacity.setValue(0);
    flashOpacity.setValue(0);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <LinearGradient
        colors={[theme.surface, theme.background, theme.background]}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        {/* Dark vignette overlay - subtle gradient darkening at edges */}
        <View style={styles.vignette}>
          {/* Top edge */}
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent"]}
            style={styles.vignetteTop}
          />
          {/* Bottom edge */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)"]}
            style={styles.vignetteBottom}
          />
          {/* Left edge */}
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.vignetteLeft}
          />
          {/* Right edge */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.vignetteRight}
          />
        </View>

        {!isActive && !timerComplete && (
          <View className="flex-1 items-center justify-center px-6">
            <View
              className="items-center justify-center"
              style={{ marginTop: -50, marginBottom: 8 }}
            >
              <Image
                source={require("../assets/images/stopwatch_5_photoroom.png")}
                style={{
                  width: 240,
                  height: 240,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View className="mb-12">
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                  color: theme.text,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Ready to take action?
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.textSecondary,
                  textAlign: "center",
                  paddingHorizontal: 16,
                  lineHeight: 22.4,
                  marginBottom: 12,
                }}
              >
                You have {timerDuration} seconds. When it hits zero, you
                approach her.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.textSecondary,
                  textAlign: "center",
                  paddingHorizontal: 16,
                  lineHeight: 20,
                  fontStyle: "italic",
                }}
              >
                A proven cognitive technique that overrides fear and helps you
                act instantly.
              </Text>
            </View>

            <View className="w-full px-6">
              <Button
                title="Start Now"
                onPress={handleStart}
                className="w-full"
              />
            </View>
          </View>
        )}

        {isActive && (
          <View className="flex-1">
            {/* Flash overlay for last 3 seconds - covers entire screen */}
            <Animated.View
              style={[styles.flashOverlay, { opacity: flashOpacity }]}
              pointerEvents="none"
            />

            {/* Large circular countdown centered */}
            <View className="flex-1 items-center justify-center px-6">
              <Timer
                duration={timerDuration}
                onComplete={handleComplete}
                isActive={isActive}
                onTimeUpdate={handleTimerUpdate}
              />

              {/* Motivation text below with fade-in */}
              <Animated.View
                style={[
                  styles.bottomTextContainer,
                  { opacity: bottomTextOpacity },
                ]}
              >
                <Text style={styles.bottomText}>{countdownMessage}</Text>
              </Animated.View>
            </View>

            {/* Cancel button at bottom - ghost style */}
            <View
              style={[
                styles.cancelButtonContainer,
                { paddingBottom: insets.bottom + 12 },
              ]}
            >
              <TouchableOpacity
                onPress={handleReset}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>I need a moment</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {timerComplete && (
          <Animated.View
            style={[styles.completeContainer, { opacity: fadeAnim }]}
          >
            <View className="flex-1 items-center justify-center px-6">
              <View
                className="items-center"
                style={{ paddingTop: 28, paddingBottom: 18 }}
              >
                <Image
                  source={require("../assets/images/pink_lightning.png")}
                  style={{
                    width: 200,
                    height: 200,
                    resizeMode: "contain",
                  }}
                />
                {/* Large bold pink headline */}
                <Text
                  style={{
                    fontSize: 44,
                    fontWeight: "bold",
                    color: theme.primary,
                    textAlign: "center",
                    paddingTop: 12,
                    paddingBottom: 18,
                    lineHeight: 57.2,
                  }}
                >
                  Go now.
                </Text>
                {/* Subtext in soft grey */}
                <Text
                  style={{
                    fontSize: 18,
                    color: theme.textSecondary,
                    textAlign: "center",
                    lineHeight: 25.2,
                    marginBottom: 40,
                  }}
                >
                  {motivationalMessage}
                </Text>
              </View>

              {/* Main CTA button - I approached */}
              <TouchableOpacity
                onPress={() => navigation.navigate("PostActionReview")}
                style={styles.approachedButton}
                activeOpacity={0.7}
              >
                <Text style={styles.approachedButtonText}>I approached</Text>
              </TouchableOpacity>

              {/* Try again as text link */}
              <Text onPress={handleReset} style={styles.tryAgainLink}>
                Try again
              </Text>
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  vignetteTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  vignetteBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  vignetteLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.2,
  },
  vignetteRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: width * 0.2,
  },
  bottomTextContainer: {
    marginTop: 48,
    paddingHorizontal: 20,
  },
  bottomText: {
    fontSize: 16,
    color: theme.text,
    opacity: 0.9,
    textAlign: "center",
    lineHeight: 22.4,
  },
  cancelButtonContainer: {
    paddingHorizontal: "10%",
    alignItems: "center",
  },
  cancelButton: {
    width: "80%",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    color: theme.primary,
    fontWeight: "500",
  },
  completeContainer: {
    flex: 1,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.primary,
    zIndex: 10,
  },
  approachedButton: {
    width: "67.5%",
    height: 44,
    backgroundColor: theme.primaryRgba(0.08),
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 42,
  },
  approachedButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  tryAgainLink: {
    marginTop: 15,
    textAlign: "center",
    color: theme.textSecondary,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
