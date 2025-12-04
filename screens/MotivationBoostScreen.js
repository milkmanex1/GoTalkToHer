import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { Storage } from '../lib/storage';
import { generateMotivationQuote } from '../lib/aiService';
import { handleError } from '../lib/errorHandler';

const MOTIVATION_QUOTES = {
  'Action Beats Fear': [
    "The only way to overcome fear is to face it. Every small step counts.",
    "Courage isn't the absence of fear; it's acting despite it.",
    "You don't have to be perfect, you just have to start.",
    "The best time to take action was yesterday. The second best time is now.",
  ],
  'Rejection Resilience': [
    "Rejection is redirection. It's not about you, it's about compatibility.",
    "Every 'no' brings you closer to a 'yes'. Keep going.",
    "Rejection is protection - it saves you from wrong matches.",
    "Your worth isn't determined by someone else's response.",
  ],
  'Self-Worth': [
    "You are enough, exactly as you are. Believe it.",
    "Confidence comes from within. You have everything you need.",
    "Your value doesn't decrease based on someone's inability to see it.",
    "You're not trying to prove yourself - you're expressing yourself.",
  ],
  'Calm Breathing': [
    "Take a deep breath. You've got this. One moment at a time.",
    "Breathe in courage, breathe out fear. You're stronger than you think.",
    "Inhale confidence, exhale doubt. You're ready.",
    "Your breath is your anchor. Use it to ground yourself.",
  ],
};

export default function MotivationBoostScreen({ navigation }) {
  const [aiQuote, setAiQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuote = async () => {
    setLoading(true);
    try {
      const userId = await Storage.getUserId();
      if (!userId) {
        Alert.alert('Error', 'Please complete onboarding first');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) {
        Alert.alert('Error', 'Profile not found');
        return;
      }

      const quote = await generateMotivationQuote(profile);
      setAiQuote(quote);
    } catch (error) {
      handleError(error, 'Failed to generate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-8">
        <Button
          title={loading ? 'Generating...' : 'Give me a fresh quote'}
          onPress={handleGenerateQuote}
          disabled={loading}
          loading={loading}
          variant="accent"
          className="mb-6"
        />

        {aiQuote && (
          <Card className="mb-6 bg-accent/10 border-accent">
            <Text className="text-lg font-semibold text-text mb-2">
              Your Personalized Quote
            </Text>
            <Text className="text-base text-text italic">"{aiQuote}"</Text>
          </Card>
        )}

        {Object.entries(MOTIVATION_QUOTES).map(([category, quotes]) => (
          <View key={category} className="mb-6">
            <Text className="text-xl font-semibold text-text mb-3">
              {category}
            </Text>
            {quotes.map((quote, index) => (
              <Card key={index} className="mb-3">
                <Text className="text-base text-text italic">"{quote}"</Text>
              </Card>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

