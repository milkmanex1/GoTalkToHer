import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  try {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      console.log('Push notifications require a physical device');
      return null;
    }

    return token;
  } catch (error) {
    console.log('Error registering for push notifications:', error);
    return null;
  }
}

export async function scheduleDailyMotivationalNotification() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule daily notification at 9 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Motivation 💪",
        body: "You've got this! Take one small step today.",
        sound: true,
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    // Optional: Schedule warm-up challenge reminder at 2 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Warm-up Challenge 🌟",
        body: "Try one warm-up challenge today. You're building confidence!",
        sound: true,
      },
      trigger: {
        hour: 14,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    console.log('Error scheduling notifications:', error);
    // Don't throw - notifications are optional
  }
}

