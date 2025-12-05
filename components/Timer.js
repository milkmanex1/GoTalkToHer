import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function Timer({ duration, onComplete, isActive }) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const [progress, setProgress] = useState(1);
  const intervalRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(1)).current;
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isActive) {
      // Reset completion flag
      hasCompletedRef.current = false;
      setRemainingTime(duration);
      setProgress(1);
      animatedValue.setValue(1);

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

      // Countdown timer
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = Math.max(0, prev - 1);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isActive, duration]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 8;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View className="items-center justify-center">
      <Svg
        width={200}
        height={200}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Remaining stroke - muted grey */}
        <Circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#2D2F34"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress stroke - pink accent */}
        <Circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#FF4FA3"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Large pink bold number */}
        <Text style={{ fontSize: 40, fontWeight: "bold", color: "#FF4FA3" }}>
          {Math.ceil(remainingTime)}
        </Text>
      </View>
    </View>
  );
}
