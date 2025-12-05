import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Button from '../components/Button';
import ChatMessage from '../components/ChatMessage';
import { supabase } from '../lib/supabase';
import { Storage } from '../lib/storage';
import { generatePersonalizedCoaching } from '../lib/aiService';
import { handleError } from '../lib/errorHandler';

export default function WingmanChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadUserProfileAndHistory();
  }, []);

  const loadUserProfileAndHistory = async () => {
    try {
      const userId = await Storage.getUserId();
      if (!userId) {
        Alert.alert('Error', 'Please complete onboarding first');
        navigation.goBack();
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      // Load recent chat history
      const { data: history } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })
        .limit(20);

      if (history) {
        const formattedMessages = history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedMessages);
      }

      // Add welcome message if no history
      if (!history || history.length === 0) {
        setMessages([
          {
            role: 'assistant',
            content:
              "Hey! I'm your Wingman AI coach. I'm here to help you build confidence and overcome approach anxiety. What's on your mind?",
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);

    // Add user message to UI immediately
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const userId = await Storage.getUserId();
      if (!userProfile) {
        Alert.alert('Error', 'Profile not found');
        return;
      }

      // Save user message to database
      await supabase.from('chat_messages').insert([
        {
          user_id: userId,
          role: 'user',
          content: userMessage,
        },
      ]);

      // Generate AI response
      const chatHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await generatePersonalizedCoaching(
        userProfile,
        userMessage,
        chatHistory
      );

      const assistantMessage = { role: 'assistant', content: aiResponse };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save AI response to database
      await supabase.from('chat_messages').insert([
        {
          user_id: userId,
          role: 'assistant',
          content: aiResponse,
        },
      ]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      handleError(error, 'Failed to send message. Please try again.');
      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (loadingHistory) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text style={{ color: '#A0A0A0' }}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => `message-${index}`}
        renderItem={({ item }) => (
          <ChatMessage message={item.content} isUser={item.role === 'user'} />
        )}
        contentContainerStyle={{ padding: 24 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View className="border-t border-border bg-surface px-4 py-3">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 mr-2"
            style={{ fontSize: 16, color: '#FFFFFF' }}
            placeholder="Ask for advice or share what's on your mind..."
            placeholderTextColor="#A0A0A0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Button
            title="Send"
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
            loading={loading}
            className="px-4"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

