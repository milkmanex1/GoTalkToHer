import Constants from "expo-constants";

let openaiInstance = null;

const getOpenAI = () => {
  if (!openaiInstance) {
    // Lazy require to avoid initialization issues
    const OpenAI = require("openai").default;

    const apiKey =
      Constants.expoConfig?.extra?.OPENAI_API_KEY ??
      Constants.manifest?.extra?.OPENAI_API_KEY;

    // Debug logging (safe to keep for now)
    console.log("🔍 OpenAI Config Check:");
    console.log(
      "  OPENAI_API_KEY:",
      apiKey ? `${apiKey.substring(0, 10)}...` : "MISSING"
    );

    if (!apiKey) {
      console.error("❌ Missing OpenAI API key in Expo config / manifest");
      throw new Error("OpenAI API key is not configured");
    }

    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  return openaiInstance;
};

export { getOpenAI };
