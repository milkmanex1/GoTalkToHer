import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Button from "../components/Button";
import Card from "../components/Card";
import BottomNavBar from "../components/BottomNavBar";
import { theme } from "../src/theme/colors";

const HERO_GOOD = [
  "Well done, king.",
  "You showed up today.",
  "That took courage.",
  "You moved. That's power.",
  "Proud of you, bro.",
  "That was real courage.",
  "You leaned into fear.",
  "Big step forward.",
  "That's how confidence is built.",
  "Real growth, my man.",
  "Momentum gained.",
];

const HERO_DID_NOT_APPROACH = [
  "It's okay, bro.",
  "No pressure today.",
  "You're still learning.",
  "Some days are harder.",
  "Be gentle with yourself.",
  "Progress isn't linear.",
  "You showed up — that counts.",
  "Not every rep is a win.",
  "Today wasn't the moment.",
  "You're trying. That matters.",
];

const HERO_NOT_INTERESTED = [
  "You handled that.",
  "Rejection isn't failure.",
  "You stayed bold.",
  "Still proud of you.",
  "This is part of the game.",
  "You walked away stronger.",
  "Respect, bro. You tried.",
  "Not your match today.",
  "That took guts.",
  "You're building resilience.",
];

const HYPE_MESSAGES = [
  "You did it, bro. Most guys wouldn't even try.",
  "That took guts — respect.",
  "Win or lose, you leveled up today.",
  "That's real courage. Be proud of yourself.",
  "You faced the fear. That's the W.",
  "Bro… that's main character behavior.",
  "You pushed through the nerves. That's strength.",
  "You're building momentum, king. Keep it going.",
  "Every rep makes you stronger — this was a big one.",
  "You showed up for yourself today.",
  "Fear showed up… and you still moved. That's growth.",
  "Be proud. You earned this feeling.",
  "That was brave, bro. Seriously.",
  "Your future self is thanking you right now.",
  "That was a solid W, no matter the outcome.",
  "Real talk: I'm proud of you for that.",
  "You walked the walk, king. That's rare.",
];

const SOFT_MESSAGES = [
  "It's okay, bro. You're still learning.",
  "You showed honesty — that's courage too.",
  "Not every moment has to be a win.",
  "It's alright. You'll get another chance.",
  "Be gentle with yourself — this stuff is hard.",
  "You didn't fail. You're experimenting.",
  "Showing up here still counts.",
  "Reflecting is part of the process.",
  "Today wasn't the rep. Tomorrow might be.",
  "You're trying, and that already sets you apart.",
];

export default function ReviewSubmittedScreen({ navigation, route }) {
  const { approached, aiFeedback } = route.params || {};
  const [message, setMessage] = useState("");
  const [heroText, setHeroText] = useState("");

  useEffect(() => {
    // Choose hero text
    let heroPool = HERO_GOOD;

    if (route.params?.outcome === "did_not_approach") {
      heroPool = HERO_DID_NOT_APPROACH;
    } else if (route.params?.outcome === "not_interested") {
      heroPool = HERO_NOT_INTERESTED;
    }

    const randomHero = heroPool[Math.floor(Math.random() * heroPool.length)];
    setHeroText(randomHero);

    // Choose subtext message (existing logic)
    if (approached) {
      const randomIndex = Math.floor(Math.random() * HYPE_MESSAGES.length);
      setMessage(HYPE_MESSAGES[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * SOFT_MESSAGES.length);
      setMessage(SOFT_MESSAGES[randomIndex]);
    }
  }, [approached, route.params?.outcome]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      >
        <View style={{ paddingHorizontal: 24, paddingVertical: 20, flex: 1 }}>
          {/* Spacer to center message when no AI feedback */}
          {!aiFeedback && <View style={{ flex: 1 }} />}

          {/* Hero Text */}
          {heroText !== "" && (
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: theme.primary,
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 40,
              }}
            >
              {heroText}
            </Text>
          )}

          {/* Dynamic hype/reassurance message */}
          {message && (
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: theme.text,
                marginBottom: aiFeedback ? 24 : 0,
                marginTop: aiFeedback ? 12 : 0,
                textAlign: "center",
                lineHeight: 26,
              }}
            >
              {message}
            </Text>
          )}

          {/* AI Feedback section */}
          {aiFeedback && (
            <Card
              className="mb-6"
              style={{
                backgroundColor: theme.primaryRgba(0.1),
                borderColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: theme.text,
                  marginBottom: 12,
                }}
              >
                AI Feedback:
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.text,
                  lineHeight: 24,
                }}
              >
                {aiFeedback}
              </Text>
            </Card>
          )}

          {/* Spacer to push button to bottom when no AI feedback */}
          {!aiFeedback && <View style={{ flex: 1 }} />}

          {/* Back to Home button */}
          <View style={{ marginTop: aiFeedback ? 24 : 0 }}>
            <Button
              title="Back to Home"
              onPress={() => navigation.replace("Home")}
              className="w-full"
            />
          </View>
        </View>
      </ScrollView>
      {/* Bottom navigation bar */}
      <BottomNavBar navigation={navigation} currentRoute="ReviewSubmitted" />
    </SafeAreaView>
  );
}
