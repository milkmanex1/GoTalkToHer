import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../src/theme/colors";

export default function TestScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <View style={styles.container}>
        <Text style={styles.text}>App is working!</Text>
        <Text style={styles.subtext}>If you see this, rendering works</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text,
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: theme.textSecondary,
  },
});
