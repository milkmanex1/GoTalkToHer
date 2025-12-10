import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ChatMessage from "../components/ChatMessage";
import BottomNavBar from "../components/BottomNavBar";
import { supabase } from "../lib/supabase";
import { generatePersonalizedCoaching } from "../lib/aiService";
import { handleError } from "../lib/errorHandler";
import { theme } from "../src/theme/colors";

// Arrow Down Icon component
const ArrowDownIcon = ({ color, size = 24 }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M12 5v14" />
    <Path d="m19 12-7 7-7-7" />
  </Svg>
);

export default function WingmanChatScreen({ navigation }) {
  const { profile, session, ready, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (ready && profile && session) {
      loadChatHistory();
    } else if (ready && !session) {
      Alert.alert("Error", "You must be logged in to use the chat");
      navigation.goBack();
    } else if (ready && session && !profile) {
      Alert.alert(
        "Error",
        "Profile not found. Please complete onboarding first."
      );
      navigation.replace("Onboarding");
    }
  }, [ready, profile, session]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadChatHistory = async () => {
    if (!profile?.id) return;

    try {
      // Load recent chat history using user_id - limit to last 30 messages
      const { data: history } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", profile.id)
        .order("timestamp", { ascending: false })
        .limit(30);

      if (history) {
        // Reverse to show oldest first (ascending order)
        const formattedMessages = history.reverse().map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedMessages);
      }

      // Add welcome message if no history
      if (!history || history.length === 0) {
        setMessages([
          {
            role: "assistant",
            content:
              "Hey! I'm your Wingman AI coach. I'm here to help you build confidence and overcome approach anxiety. What's on your mind?",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    if (!profile || !session) {
      Alert.alert("Error", "You must be logged in to send messages");
      return;
    }

    const userMessage = inputText.trim();
    setInputText("");
    setLoading(true);

    // Add user message to UI immediately
    const newUserMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);

    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      // Save user message to database using user_id
      await supabase.from("chat_messages").insert([
        {
          user_id: profile.id,
          role: "user",
          content: userMessage,
        },
      ]);

      // Generate AI response
      const chatHistory = [...messages, newUserMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await generatePersonalizedCoaching(
        profile,
        userMessage,
        chatHistory
      );

      const assistantMessage = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save AI response to database using user_id
      await supabase.from("chat_messages").insert([
        {
          user_id: profile.id,
          role: "assistant",
          content: aiResponse,
        },
      ]);

      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    } catch (error) {
      handleError(error, "Failed to send message. Please try again.");
      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!ready || authLoading || loadingHistory) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 16 }}>
            Loading chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile || !session) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <Text style={{ color: theme.textSecondary }}>Please log in</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={[]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => `message-${index}`}
          renderItem={({ item }) => (
            <ChatMessage message={item.content} isUser={item.role === "user"} />
          )}
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent;

            // User is scrolling up if they are at least 40px above the bottom
            const isUserScrollingUp =
              contentOffset.y <
              contentSize.height - layoutMeasurement.height - 40;

            setShowJumpButton(isUserScrollingUp);
          }}
          scrollEventThrottle={50}
        />
        {/* Floating "Jump to Latest" button */}
        {showJumpButton && (
          <TouchableOpacity
            onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            style={{
              position: "absolute",
              bottom: insets.bottom + 150, // ensures it floats above bottom nav
              right: 4,
              backgroundColor: "#3d3d3d",
              width: 24,
              height: 24,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              padding: 12,
            }}
          >
            <ArrowDownIcon color="#FFFFFF" size={24} />
          </TouchableOpacity>
        )}
        <View className="border-t border-border bg-surface px-4 py-2">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 mr-2"
              style={{ fontSize: 16, color: theme.text }}
              placeholder="Ask for advice or share what's on your mind..."
              placeholderTextColor={theme.textSecondary}
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
        {/* Bottom navigation bar */}
        <BottomNavBar navigation={navigation} currentRoute="WingmanChat" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
