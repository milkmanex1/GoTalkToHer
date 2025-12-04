import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { supabase } from '../lib/supabase';
import { Storage } from '../lib/storage';
import { processPostActionReview } from '../lib/aiService';
import { handleError } from '../lib/errorHandler';

const OUTCOMES = [
  { id: 'did_not_approach', label: "Did not approach" },
  { id: 'not_interested', label: "Approached but she wasn't interested" },
  { id: 'friendly', label: 'She was friendly' },
  { id: 'got_number', label: 'Got her number' },
  { id: 'conversation_no_number', label: 'Had a conversation but no number' },
];

export default function PostActionReviewScreen({ navigation }) {
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [whatHappened, setWhatHappened] = useState('');
  const [howTheyFelt, setHowTheyFelt] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOutcome) {
      Alert.alert('Error', 'Please select an outcome');
      return;
    }

    if (!whatHappened.trim()) {
      Alert.alert('Error', 'Please describe what happened');
      return;
    }

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

      const notes = {
        whatHappened: whatHappened.trim(),
        howTheyFelt: howTheyFelt.trim(),
      };

      // Generate AI feedback
      const feedback = await processPostActionReview(
        OUTCOMES.find((o) => o.id === selectedOutcome).label,
        notes,
        profile
      );

      setAiFeedback(feedback);

      // Save to database
      const { error } = await supabase.from('approach_events').insert([
        {
          user_id: userId,
          outcome: selectedOutcome,
          notes: JSON.stringify(notes),
          ai_feedback: feedback,
        },
      ]);

      if (error) throw error;

      // Update user profile stats
      if (selectedOutcome === 'got_number' || selectedOutcome === 'friendly') {
        await supabase
          .from('user_profile')
          .update({
            past_successes: (profile.past_successes || 0) + 1,
          })
          .eq('id', userId);
      } else if (selectedOutcome === 'not_interested') {
        await supabase
          .from('user_profile')
          .update({
            past_rejections: (profile.past_rejections || 0) + 1,
          })
          .eq('id', userId);
      }

      setSubmitted(true);
    } catch (error) {
      handleError(error, 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedOutcome(null);
    setWhatHappened('');
    setHowTheyFelt('');
    setAiFeedback(null);
    setSubmitted(false);
  };

  if (submitted && aiFeedback) {
    return (
      <ScrollView className="flex-1 bg-background">
        <View className="px-6 py-8">
          <Card className="mb-6 bg-primary/10 border-primary">
            <Text className="text-2xl font-bold text-primary mb-4 text-center">
              Great job taking action! 🎉
            </Text>
            <Text className="text-lg font-semibold text-text mb-3">
              AI Feedback:
            </Text>
            <Text className="text-base text-text">{aiFeedback}</Text>
          </Card>
          <Button title="Submit Another Review" onPress={handleReset} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-8">
        <Text className="text-xl font-semibold text-text mb-6">
          How did it go?
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-3">
            Outcome
          </Text>
          {OUTCOMES.map((outcome) => (
            <TouchableOpacity
              key={outcome.id}
              onPress={() => setSelectedOutcome(outcome.id)}
            >
              <Card
                className={`mb-2 ${
                  selectedOutcome === outcome.id
                    ? 'bg-primary/10 border-primary border-2'
                    : ''
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedOutcome === outcome.id
                      ? 'font-semibold text-primary'
                      : 'text-text'
                  }`}
                >
                  {outcome.label}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
            What happened?
          </Text>
          <TextInput
            className="bg-surface border border-gray-200 rounded-xl px-4 py-3 text-base min-h-[100px]"
            placeholder="Describe what happened..."
            value={whatHappened}
            onChangeText={setWhatHappened}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">
            How did you feel?
          </Text>
          <TextInput
            className="bg-surface border border-gray-200 rounded-xl px-4 py-3 text-base min-h-[100px]"
            placeholder="Share your feelings..."
            value={howTheyFelt}
            onChangeText={setHowTheyFelt}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Button
          title={loading ? 'Processing...' : 'Get AI Feedback'}
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

