import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const messageIdCounter = useRef(0);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (!ready) return; // app still initializing
    if (authLoading) return; // auth still loading
    if (!session) {
      // user not logged in
      Alert.alert("Error", "You must be logged in to use the chat");
      navigation.goBack();
      return;
    }
    if (!profile) {
      // profile still loading, wait
      console.log("WingmanChat: Profile still loading...");
      return;
    }

    // now everything is ready → load chat
    loadChatHistory();
  }, [ready, profile, session, authLoading]);

  // Safe scroll to end function
  const scrollToEndSafely = useCallback(() => {
    try {
      if (flatListRef.current && messages.length > 0) {
        // Clear any pending scroll
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        // Use setTimeout to ensure FlatList is ready
        scrollTimeoutRef.current = setTimeout(() => {
          try {
            flatListRef.current?.scrollToEnd({ animated: true });
          } catch (scrollError) {
            console.error("Error scrolling to end:", scrollError);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error in scrollToEndSafely:", error);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToEndSafely();
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, scrollToEndSafely]);

  const loadChatHistory = async () => {
    if (!profile?.id) {
      console.error("WingmanChat: Cannot load history - no profile ID");
      setLoadingHistory(false);
      return;
    }

    try {
      console.log("WingmanChat: Loading chat history for user:", profile.id);
      // Load recent chat history using user_id - limit to last 30 messages
      const { data: history, error: fetchError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", profile.id)
        .order("timestamp", { ascending: false })
        .limit(30);

      if (fetchError) {
        console.error("WingmanChat: Error fetching history:", fetchError);
        throw fetchError;
      }

      if (history && history.length > 0) {
        // Reverse to show oldest first (ascending order) and add unique IDs
        const formattedMessages = history.reverse().map((msg, idx) => ({
          id: msg.id || `msg-${Date.now()}-${idx}`,
          role: msg.role || "assistant",
          content: msg.content || "",
        }));
        console.log("WingmanChat: Loaded", formattedMessages.length, "messages");
        setMessages(formattedMessages);
        messageIdCounter.current = formattedMessages.length;
      } else {
        // Add welcome message if no history
        const welcomeMessage = {
          id: `msg-welcome-${Date.now()}`,
          role: "assistant",
          content:
            "Hey! I'm your Wingman AI coach. I'm here to help you build confidence and overcome approach anxiety. What's on your mind?",
        };
        console.log("WingmanChat: No history found, showing welcome message");
        setMessages([welcomeMessage]);
        messageIdCounter.current = 1;
      }
    } catch (error) {
      console.error("WingmanChat: Error loading chat:", error);
      handleError(error, "Failed to load chat history. Please try again.");
      // Set empty state with welcome message on error
      setMessages([
        {
          id: `msg-welcome-error-${Date.now()}`,
          role: "assistant",
          content:
            "Hey! I'm your Wingman AI coach. I'm here to help you build confidence and overcome approach anxiety. What's on your mind?",
        },
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) {
      console.log("WingmanChat: Send blocked - empty text or loading");
      return;
    }
    if (!profile || !session) {
      console.error("WingmanChat: Send blocked - no profile or session");
      Alert.alert("Error", "You must be logged in to send messages");
      return;
    }

    const userMessage = inputText.trim();
    console.log("WingmanChat: Sending message:", userMessage.substring(0, 50));
    
    // Clear input immediately to prevent double-sends
    setInputText("");
    setLoading(true);

    // Generate unique ID for user message
    const userMessageId = `msg-user-${Date.now()}-${++messageIdCounter.current}`;
    const newUserMessage = { 
      id: userMessageId,
      role: "user", 
      content: userMessage 
    };

    // Add user message to UI immediately
    setMessages((prev) => {
      try {
        return [...prev, newUserMessage];
      } catch (error) {
        console.error("WingmanChat: Error updating messages:", error);
        return prev;
      }
    });

    // Scroll to bottom after state update
    scrollToEndSafely();

    try {
      // Save user message to database using user_id
      const { error: insertError } = await supabase.from("chat_messages").insert([
        {
          user_id: profile.id,
          role: "user",
          content: userMessage,
        },
      ]);

      if (insertError) {
        console.error("WingmanChat: Error saving user message:", insertError);
        throw insertError;
      }

      // Generate AI response
      const chatHistory = [...messages, newUserMessage]
        .filter(msg => msg && msg.content) // Filter out any invalid messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      console.log("WingmanChat: Generating AI response...");
      const aiResponse = await generatePersonalizedCoaching(
        profile,
        userMessage,
        chatHistory
      );

      if (!aiResponse || typeof aiResponse !== 'string') {
        throw new Error("Invalid AI response received");
      }

      const assistantMessageId = `msg-assistant-${Date.now()}-${++messageIdCounter.current}`;
      const assistantMessage = { 
        id: assistantMessageId,
        role: "assistant", 
        content: aiResponse 
      };
      
      setMessages((prev) => {
        try {
          return [...prev, assistantMessage];
        } catch (error) {
          console.error("WingmanChat: Error updating messages with AI response:", error);
          return prev;
        }
      });

      // Save AI response to database using user_id
      const { error: aiInsertError } = await supabase.from("chat_messages").insert([
        {
          user_id: profile.id,
          role: "assistant",
          content: aiResponse,
        },
      ]);

      if (aiInsertError) {
        console.error("WingmanChat: Error saving AI message:", aiInsertError);
        // Don't throw - message is already in UI
      }

      // Scroll to bottom after AI response
      scrollToEndSafely();
    } catch (error) {
      console.error("WingmanChat: Error in handleSend:", error);
      handleError(error, "Failed to send message. Please try again.");
      // Remove user message on error
      setMessages((prev) => {
        try {
          return prev.filter(msg => msg.id !== userMessageId);
        } catch (filterError) {
          console.error("WingmanChat: Error removing failed message:", filterError);
          return prev;
        }
      });
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
          keyExtractor={(item) => item?.id || `msg-${Date.now()}-${Math.random()}`}
          renderItem={({ item }) => {
            try {
              if (!item || !item.content) {
                console.warn("WingmanChat: Invalid message item:", item);
                return null;
              }
              return (
                <ChatMessage 
                  message={item.content} 
                  isUser={item.role === "user"} 
                />
              );
            } catch (error) {
              console.error("WingmanChat: Error rendering message:", error);
              return null;
            }
          }}
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          onContentSizeChange={() => {
            try {
              scrollToEndSafely();
            } catch (error) {
              console.error("WingmanChat: Error in onContentSizeChange:", error);
            }
          }}
          onScroll={(event) => {
            try {
              const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;

              // User is scrolling up if they are at least 40px above the bottom
              const isUserScrollingUp =
                contentOffset.y <
                contentSize.height - layoutMeasurement.height - 40;

              setShowJumpButton(isUserScrollingUp);
            } catch (error) {
              console.error("WingmanChat: Error in onScroll:", error);
            }
          }}
          scrollEventThrottle={50}
        />
        {/* Floating "Jump to Latest" button */}
        {showJumpButton && (
          <TouchableOpacity
            onPress={() => {
              try {
                scrollToEndSafely();
              } catch (error) {
                console.error("WingmanChat: Error jumping to latest:", error);
              }
            }}
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
              onChangeText={(text) => {
                try {
                  setInputText(text);
                } catch (error) {
                  console.error("WingmanChat: Error updating input text:", error);
                }
              }}
              multiline
              maxLength={500}
              onFocus={() => {
                console.log("WingmanChat: TextInput focused");
              }}
              onBlur={() => {
                console.log("WingmanChat: TextInput blurred");
              }}
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
