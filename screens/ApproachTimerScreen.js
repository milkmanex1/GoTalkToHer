import React, { useState, useEffect, useRef } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import Timer from "../components/Timer";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

const DURATION = 15; // Fixed timer duration

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
  const [isActive, setIsActive] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [sound, setSound] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [remainingTime, setRemainingTime] = useState(DURATION);
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
    setRemainingTime(DURATION);
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

    // Save timer event to Supabase
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        const authUserId = auth.user.id;
        await supabase.from("approach_events").insert([
          {
            user_id: authUserId,
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
    setRemainingTime(DURATION);
    fadeAnim.setValue(0);
    bottomTextOpacity.setValue(0);
    flashOpacity.setValue(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }} edges={[]}>
      <LinearGradient
        colors={["#181C24", "#101014", "#000000"]}
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
            <View className="mb-12 items-center justify-center">
              <Image
                source={require("../assets/images/stopwatch.png")}
                style={{
                  width: 200,
                  height: 200,
                  resizeMode: "contain",
                }}
              />
            </View>

            <View className="mb-12">
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                  color: "#FFFFFF",
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Ready to take action?
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#D0D0D0",
                  textAlign: "center",
                  paddingHorizontal: 16,
                  lineHeight: 22.4,
                  marginBottom: 12,
                }}
              >
                You have {DURATION} seconds. When it hits zero, you approach
                her.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#A0A0A0",
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
                duration={DURATION}
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
              <View className="mb-12 items-center">
                <Image
                  source={require("../assets/images/pink_lightning.png")}
                  style={{
                    width: 180,
                    height: 180,
                    resizeMode: "contain",
                    marginBottom: 32,
                  }}
                />
                {/* Large bold pink headline */}
                <Text
                  style={{
                    fontSize: 36,
                    fontWeight: "bold",
                    color: "#FF4FA3",
                    textAlign: "center",
                    marginBottom: 16,
                    lineHeight: 46.8,
                  }}
                >
                  Go now.
                </Text>
                {/* Subtext in soft white */}
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    textAlign: "center",
                    lineHeight: 28,
                  }}
                >
                  {motivationalMessage}
                </Text>
              </View>
              <View className="w-full px-6">
                <Button
                  title="Try again"
                  onPress={handleReset}
                  className="w-full"
                />
              </View>
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
    color: "#FFFFFF",
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
    borderColor: "#FF4FA3",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#FF4FA3",
    fontWeight: "500",
  },
  completeContainer: {
    flex: 1,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FF4FA3",
    zIndex: 10,
  },
});
