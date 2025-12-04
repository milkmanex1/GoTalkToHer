import "dotenv/config";

export default {
  expo: {
    name: "Go Talk To Her",
    slug: "go-talk-to-her",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      backgroundColor: "#6366f1",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gotalktoher.app",
    },
    android: {
      package: "com.gotalktoher.app",
      permissions: ["NOTIFICATIONS"],
    },
    plugins: [
      [
        "expo-notifications",
        {
          color: "#ffffff",
        },
      ],
    ],
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  },
};
