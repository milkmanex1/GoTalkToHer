import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
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
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRoute();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // User is signed in, check if profile exists
          const { data: profile } = await supabase
            .from('user_profile')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (profile) {
            setInitialRoute('Home');
          } else {
            setInitialRoute('Onboarding');
          }
        } else {
          // User is signed out
          setInitialRoute('Login');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      // Check if session exists
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // No session, go to login
        setInitialRoute('Login');
        setLoading(false);
        return;
      }

      const authUserId = session.user.id;

      // Check if profile exists
      const { data: profile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (profile) {
        // Profile exists, go to home
        setInitialRoute('Home');
      } else {
        // No profile, go to onboarding
        setInitialRoute('Onboarding');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // On error, default to login
      setInitialRoute('Login');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0E0F12' }}>
        <ActivityIndicator size="large" color="#FF4FA3" />
        <Text style={{ color: '#D0D0D0', marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
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
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
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

