import Constants from "expo-constants";

let openaiInstance = null;

const getOpenAI = () => {
  if (!openaiInstance) {
    // Lazy require to avoid initialization issues
    const OpenAI = require("openai").default;
    const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;

    openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiInstance;
};

export { getOpenAI };
