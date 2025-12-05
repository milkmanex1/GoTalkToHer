import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function Timer({ duration, onComplete, isActive }) {
  const [remainingTime, setRemainingTime] = useState(duration);

  const animatedValue = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const hasCompletedRef = useRef(false);

  const radius = 80;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // Convert Circle into an animated component
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  useEffect(() => {
    if (!isActive) {
      // Reset everything when timer is not active
      resetTimer();
      return;
    }

    // Reset before starting
    resetTimer();

    // Animate circle stroke 1 → 0
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: duration * 1000,
      useNativeDriver: false, // SVG doesn't support true native driver
    }).start();

    // Countdown each second
    intervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        const newValue = prev - 1;

        if (newValue <= 0 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          clearInterval(intervalRef.current);

          // Slight async to avoid render-cycle crash
          setTimeout(() => {
            onComplete && onComplete();
          }, 30);

          return 0;
        }

        return newValue;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isActive, duration]);

  const resetTimer = () => {
    hasCompletedRef.current = false;
    setRemainingTime(duration);
    animatedValue.setValue(1);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // Map animation value to stroke offset
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circumference], // 1 → full circle, 0 → empty
  });

  return (
    <View className="items-center justify-center">
      <Svg
        width={200}
        height={200}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background Ring */}
        <Circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#2D2F34"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Countdown Ring */}
        <AnimatedCircle
          cx={100}
          cy={100}
          r={radius}
          stroke="#FF4FA3"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Timer Number */}
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#FF4FA3",
          }}
        >
          {remainingTime}
        </Text>
      </View>
    </View>
  );
}
