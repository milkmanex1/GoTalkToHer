import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function Timer({ duration, onComplete, isActive }) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const [progress, setProgress] = useState(1);
  const intervalRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      setRemainingTime(duration);
      setProgress(1);
      animatedValue.setValue(1);
      
      // Animate progress from 1 to 0
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start();
      
      // Update progress state for rendering
      const progressInterval = setInterval(() => {
        animatedValue.addListener(({ value }) => {
          setProgress(value);
        });
      }, 50);
      
      // Countdown timer
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = Math.max(0, prev - 1);
          if (newTime <= 0) {
            clearInterval(intervalRef.current);
            clearInterval(progressInterval);
            onComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
      
      return () => {
        clearInterval(intervalRef.current);
        clearInterval(progressInterval);
        animatedValue.removeAllListeners();
      };
    } else {
      setRemainingTime(duration);
      setProgress(1);
      animatedValue.setValue(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      animatedValue.removeAllListeners();
    };
  }, [isActive, duration]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 8;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View className="items-center justify-center">
      <Svg width={200} height={200} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#FF3E84"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text className="text-6xl font-bold text-white">
          {Math.ceil(remainingTime)}
        </Text>
      </View>
    </View>
  );
}

