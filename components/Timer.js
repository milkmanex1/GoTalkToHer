import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";

export default function Timer({
  duration,
  onComplete,
  isActive,
  onTimeUpdate,
}) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const [progress, setProgress] = useState(1);
  const intervalRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  // Keep refs up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onComplete, onTimeUpdate]);

  // Breathing animation - pulse every ~900ms
  useEffect(() => {
    if (isActive && remainingTime > 0) {
      const breathingAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      );
      breathingAnim.start();
      return () => breathingAnim.stop();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isActive, remainingTime]);

  // Stronger pulse animation for last 3 seconds
  useEffect(() => {
    if (isActive && remainingTime <= 3 && remainingTime > 0) {
      // Stronger pulse on final seconds
      const strongPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      strongPulse.start();

      return () => {
        strongPulse.stop();
      };
    }
  }, [remainingTime, isActive]);

  useEffect(() => {
    if (isActive) {
      // Reset completion flag
      hasCompletedRef.current = false;
      setRemainingTime(duration);
      setProgress(1);
      animatedValue.setValue(1);
      scaleAnim.setValue(1);

      // Animate progress from 1 to 0
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start();

      // Update progress state for rendering using a listener
      const progressListener = animatedValue.addListener(({ value }) => {
        setProgress(value);
      });

      // Report initial time
      if (onTimeUpdateRef.current) {
        onTimeUpdateRef.current(duration);
      }

      // Countdown timer
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = Math.max(0, prev - 1);
          // Notify parent of time update
          if (onTimeUpdateRef.current && newTime > 0) {
            onTimeUpdateRef.current(newTime);
          }
          if (newTime <= 0 && !hasCompletedRef.current) {
            hasCompletedRef.current = true;
            clearInterval(intervalRef.current);
            // Call onComplete asynchronously to avoid setState during render
            setTimeout(() => {
              onCompleteRef.current();
            }, 0);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        animatedValue.removeListener(progressListener);
      };
    } else {
      // Reset when inactive
      hasCompletedRef.current = false;
      setRemainingTime(duration);
      setProgress(1);
      animatedValue.setValue(1);
      scaleAnim.setValue(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isActive, duration]);

  const radius = 120; // Increased from 80 to 120
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 12; // Increased from 8 to 12
  const strokeDashoffset = circumference * (1 - progress);
  const svgSize = radius * 2 + strokeWidth * 2 + 20; // Extra space for glow

  return (
    <View className="items-center justify-center">
      <Svg
        width={svgSize}
        height={svgSize}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Defs>
          {/* Outer glow for pink progress ring */}
          <RadialGradient id="glow" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FF4FA3" stopOpacity="0.6" />
            <Stop offset="70%" stopColor="#FF4FA3" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#FF4FA3" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Glow layer - subtle outer glow */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius + 8}
          fill="url(#glow)"
          opacity={progress < 1 ? 0.4 : 0}
        />

        {/* Remaining stroke - muted grey */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="#2D2F34"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke - pink accent with glow effect */}
        <Circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          stroke="#FF4FA3"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          opacity={0.95}
        />
      </Svg>

      {/* Number with breathing animation */}
      <Animated.View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Text
          style={{
            fontSize: 56,
            fontWeight: "bold",
            color: "#FF4FA3",
            textAlign: "center",
          }}
        >
          {Math.ceil(remainingTime)}
        </Text>
      </Animated.View>
    </View>
  );
}
