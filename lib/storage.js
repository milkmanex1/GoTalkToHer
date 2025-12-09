import AsyncStorage from "@react-native-async-storage/async-storage";

export const Storage = {
  getTimerDuration: async () => {
    try {
      const duration = await AsyncStorage.getItem("timerDuration");
      return duration ? parseInt(duration, 10) : 15; // Default to 15 seconds
    } catch (error) {
      console.log("Error getting timer duration:", error);
      return 15;
    }
  },

  setTimerDuration: async (duration) => {
    try {
      await AsyncStorage.setItem("timerDuration", duration.toString());
    } catch (error) {
      console.log("Error setting timer duration:", error);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log("Error clearing storage:", error);
    }
  },
};
