import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import ApproachTimerScreen from '../screens/ApproachTimerScreen';
import ConversationStartersScreen from '../screens/ConversationStartersScreen';
import MotivationBoostScreen from '../screens/MotivationBoostScreen';
import PostActionReviewScreen from '../screens/PostActionReviewScreen';
import WingmanChatScreen from '../screens/WingmanChatScreen';
import TestScreen from '../screens/TestScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0E0F12',
            borderBottomColor: '#2D2F34',
            borderBottomWidth: 1,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#FFFFFF',
          },
        }}
      >
        <Stack.Screen 
          name="Test" 
          component={TestScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Go Talk To Her' }}
        />
        <Stack.Screen 
          name="ApproachTimer" 
          component={ApproachTimerScreen}
          options={{ title: 'Approach Timer' }}
        />
        <Stack.Screen 
          name="ConversationStarters" 
          component={ConversationStartersScreen}
          options={{ title: 'Conversation Starters' }}
        />
        <Stack.Screen 
          name="MotivationBoost" 
          component={MotivationBoostScreen}
          options={{ title: 'Motivation Boost' }}
        />
        <Stack.Screen 
          name="PostActionReview" 
          component={PostActionReviewScreen}
          options={{ title: 'Post-Action Review' }}
        />
        <Stack.Screen 
          name="WingmanChat" 
          component={WingmanChatScreen}
          options={{ title: 'Wingman AI Chat' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

