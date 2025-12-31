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
  InteractionManager,
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
  const typingTimeoutRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const shouldScrollRef = useRef(false);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const authStateSubscriptionRef = useRef(null);

  // Track component mount/unmount and handle auth state changes
  useEffect(() => {
    isMountedRef.current = true;
    console.log("WingmanChat: Component mounted");
    
    // Add global error handler to catch unhandled errors
    const errorHandler = (error, isFatal) => {
      console.error("WingmanChat: GLOBAL ERROR HANDLER:", error);
      console.error("WingmanChat: Is Fatal:", isFatal);
      console.error("WingmanChat: Error stack:", error?.stack);
      console.error("WingmanChat: Error message:", error?.message);
      console.error("WingmanChat: Component mounted:", isMountedRef.current);
    };

    // Listen for auth state changes to handle session refreshes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMountedRef.current) return;
      
      console.log("WingmanChat: Auth state changed:", event, "User ID:", newSession?.user?.id || "NO SESSION");
      
      // If session expires during an operation, abort it
      if (event === 'SIGNED_OUT' && abortControllerRef.current) {
        console.log("WingmanChat: Session expired, aborting current operation");
        abortControllerRef.current.abort();
      }
      
      // If session refreshes (token refresh), log it but don't abort
      if (event === 'TOKEN_REFRESHED') {
        console.log("WingmanChat: Token refreshed");
      }
    });
    
    authStateSubscriptionRef.current = subscription;
    
    return () => {
      console.log("WingmanChat: Component unmounting");
      isMountedRef.current = false;
      if (authStateSubscriptionRef.current) {
        authStateSubscriptionRef.current.unsubscribe();
      }
      // Cancel any pending operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear all timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready) return; // app still initializing
    if (authLoading) return; // auth still loading
    if (!isMountedRef.current) return; // component unmounted
    
    if (!session) {
      // user not logged in
      console.log("WingmanChat: No session, navigating back");
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

  // Safe scroll to end function - prevents scrolling during typing
  const scrollToEndSafely = useCallback(() => {
    try {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        console.log("WingmanChat: scrollToEndSafely called but component unmounted");
        return;
      }

      // Don't scroll if user is actively typing
      if (isTypingRef.current) {
        shouldScrollRef.current = true; // Mark that we should scroll after typing stops
        return;
      }
      
      if (flatListRef.current && messages.length > 0 && isMountedRef.current) {
        // Clear any pending scroll
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
        // Use InteractionManager to defer scroll until after interactions complete
        InteractionManager.runAfterInteractions(() => {
          try {
            // Double-check mount status before scrolling
            if (!isMountedRef.current) {
              console.log("WingmanChat: Component unmounted during scroll operation");
              return;
            }
            if (flatListRef.current && !isTypingRef.current && isMountedRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          } catch (scrollError) {
            console.error("WingmanChat: Error scrolling to end:", scrollError);
            console.error("WingmanChat: Scroll error stack:", scrollError.stack);
          }
        });
      }
    } catch (error) {
      console.error("WingmanChat: Error in scrollToEndSafely:", error);
      console.error("WingmanChat: scrollToEndSafely error stack:", error.stack);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when messages change (but not during typing)
  useEffect(() => {
    if (!isTypingRef.current) {
      scrollToEndSafely();
    } else {
      shouldScrollRef.current = true;
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, scrollToEndSafely]);

  const loadChatHistory = async () => {
    // Store profile.id in a local variable to prevent it from changing mid-operation
    const currentProfileId = profile?.id;
    if (!currentProfileId) {
      console.error("WingmanChat: Cannot load history - no profile ID");
      if (isMountedRef.current) {
        setLoadingHistory(false);
      }
      return;
    }

    if (!isMountedRef.current) {
      console.log("WingmanChat: Component unmounted, skipping history load");
      return;
    }

    try {
      console.log("WingmanChat: Loading chat history for user:", currentProfileId);
      // Check if still mounted before making request
      if (!isMountedRef.current) {
        console.log("WingmanChat: Component unmounted during history fetch");
        return;
      }

      // Load recent chat history using user_id - limit to last 30 messages
      const { data: history, error: fetchError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", currentProfileId)
        .order("timestamp", { ascending: false })
        .limit(30);

      // Check again after async operation
      if (!isMountedRef.current) {
        console.log("WingmanChat: Component unmounted after history fetch");
        return;
      }

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
        if (isMountedRef.current) {
          setMessages(formattedMessages);
          messageIdCounter.current = formattedMessages.length;
        }
      } else {
        // Add welcome message if no history
        const welcomeMessage = {
          id: `msg-welcome-${Date.now()}`,
          role: "assistant",
          content:
            "Hey — welcome! 🙂\n\nI'm here to help you build confidence and feel more comfortable approaching people.\n\nWhat's on your mind?",
        };
        console.log("WingmanChat: No history found, showing welcome message");
        if (isMountedRef.current) {
          setMessages([welcomeMessage]);
          messageIdCounter.current = 1;
        }
      }
    } catch (error) {
      console.error("WingmanChat: Error loading chat:", error);
      if (isMountedRef.current) {
        handleError(error, "Failed to load chat history. Please try again.");
        // Set empty state with welcome message on error
        setMessages([
          {
            id: `msg-welcome-error-${Date.now()}`,
            role: "assistant",
            content:
              "Hey — welcome! 🙂\n\nI'm here to help you build confidence and feel more comfortable approaching people.\n\nWhat's on your mind?",
          },
        ]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingHistory(false);
      }
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

    // Store profile and session in local variables to prevent them from changing mid-operation
    const currentProfile = profile;
    const currentProfileId = profile.id;
    const currentSession = session;

    if (!currentProfileId || !currentSession) {
      console.error("WingmanChat: Invalid profile or session at start of send");
      Alert.alert("Error", "Session expired. Please try again.");
      return;
    }

    // Create abort controller for this operation
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const userMessage = inputText.trim();
    console.log("WingmanChat: Sending message:", userMessage.substring(0, 50));
    
    // Clear input immediately to prevent double-sends
    if (isMountedRef.current) {
      setInputText("");
      setLoading(true);
    }

    // Generate unique ID for user message
    const userMessageId = `msg-user-${Date.now()}-${++messageIdCounter.current}`;
    const newUserMessage = { 
      id: userMessageId,
      role: "user", 
      content: userMessage 
    };

    // Add user message to UI immediately
    if (isMountedRef.current) {
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
    }

    try {
      // Check if component is still mounted
      if (!isMountedRef.current || signal.aborted) {
        console.log("WingmanChat: Operation cancelled - component unmounted or aborted");
        return;
      }

      // Verify auth state is still valid
      if (!currentProfileId || !currentSession) {
        throw new Error("Session expired during operation");
      }

      // Save user message to database using user_id
      const { error: insertError } = await supabase.from("chat_messages").insert([
        {
          user_id: currentProfileId,
          role: "user",
          content: userMessage,
        },
      ]);

      // Check again after async operation
      if (!isMountedRef.current || signal.aborted) {
        console.log("WingmanChat: Operation cancelled after insert");
        return;
      }

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
      
      // Check auth state before AI call
      if (!isMountedRef.current || signal.aborted) {
        console.log("WingmanChat: Operation cancelled before AI call");
        return;
      }

      const aiResponse = await generatePersonalizedCoaching(
        currentProfile,
        userMessage,
        chatHistory
      );

      // Check again after AI call (this is where auth state might have changed)
      if (!isMountedRef.current || signal.aborted) {
        console.log("WingmanChat: Operation cancelled after AI response");
        return;
      }

      // Verify auth state is still valid after AI call
      if (!profile || !session || profile.id !== currentProfileId) {
        console.error("WingmanChat: Auth state changed during AI call");
        throw new Error("Session expired. Please try again.");
      }

      if (!aiResponse || typeof aiResponse !== 'string') {
        throw new Error("Invalid AI response received");
      }

      const assistantMessageId = `msg-assistant-${Date.now()}-${++messageIdCounter.current}`;
      const assistantMessage = { 
        id: assistantMessageId,
        role: "assistant", 
        content: aiResponse 
      };
      
      if (isMountedRef.current) {
        setMessages((prev) => {
          try {
            return [...prev, assistantMessage];
          } catch (error) {
            console.error("WingmanChat: Error updating messages with AI response:", error);
            return prev;
          }
        });
      }

      // Save AI response to database using user_id
      if (isMountedRef.current && !signal.aborted) {
        const { error: aiInsertError } = await supabase.from("chat_messages").insert([
          {
            user_id: currentProfileId,
            role: "assistant",
            content: aiResponse,
          },
        ]);

        if (aiInsertError) {
          console.error("WingmanChat: Error saving AI message:", aiInsertError);
          // Don't throw - message is already in UI
        }
      }

      // Scroll to bottom after AI response
      if (isMountedRef.current) {
        scrollToEndSafely();
      }
    } catch (error) {
      // Don't show error if operation was aborted
      if (signal.aborted) {
        console.log("WingmanChat: Operation aborted");
        return;
      }

      console.error("WingmanChat: Error in handleSend:", error);
      
      // Check if it's an auth error
      if (error.message?.includes("Session expired") || error.message?.includes("JWT")) {
        Alert.alert("Session Expired", "Your session has expired. Please try again.");
      } else {
        handleError(error, "Failed to send message. Please try again.");
      }
      
      // Remove user message on error (only if still mounted)
      if (isMountedRef.current) {
        setMessages((prev) => {
          try {
            return prev.filter(msg => msg.id !== userMessageId);
          } catch (filterError) {
            console.error("WingmanChat: Error removing failed message:", filterError);
            return prev;
          }
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
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
    console.log("WingmanChat: Rendering login required screen - profile:", !!profile, "session:", !!session);
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

  // Wrap render in try-catch to prevent crashes
  try {
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
          data={Array.isArray(messages) ? messages : []}
          keyExtractor={(item) => {
            // Ensure we always return a valid string key
            if (item?.id && typeof item.id === 'string') {
              return item.id;
            }
            return `msg-${Date.now()}-${Math.random()}`;
          }}
          renderItem={({ item, index }) => {
            try {
              if (!item || !item.content) {
                console.warn("WingmanChat: Invalid message item:", item);
                return null;
              }
              // Memoize the message content to prevent unnecessary re-renders
              return (
                <ChatMessage 
                  key={item.id || `msg-${index}`}
                  message={String(item.content)} 
                  isUser={item.role === "user"} 
                />
              );
            } catch (error) {
              console.error("WingmanChat: Error rendering message:", error, item);
              return null;
            }
          }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 12, paddingVertical: 16 }}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          onContentSizeChange={() => {
            try {
              // Check mount status first
              if (!isMountedRef.current) {
                return;
              }
              // Only auto-scroll if user is not actively typing
              if (!isTypingRef.current && isMountedRef.current) {
                scrollToEndSafely();
              }
            } catch (error) {
              console.error("WingmanChat: Error in onContentSizeChange:", error);
              console.error("WingmanChat: onContentSizeChange error stack:", error.stack);
            }
          }}
          onScroll={(event) => {
            try {
              if (!isMountedRef.current) {
                return;
              }

              const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent;

              // User is scrolling up if they are at least 40px above the bottom
              const isUserScrollingUp =
                contentOffset.y <
                contentSize.height - layoutMeasurement.height - 40;

              if (isMountedRef.current) {
                setShowJumpButton(isUserScrollingUp);
              }
            } catch (error) {
              console.error("WingmanChat: Error in onScroll:", error);
              console.error("WingmanChat: onScroll error stack:", error.stack);
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
                  // Check if component is still mounted
                  if (!isMountedRef.current) {
                    console.log("WingmanChat: onChangeText called but component unmounted");
                    return;
                  }

                  // Clear any existing typing timeout
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                  }

                  // Mark that user is typing
                  isTypingRef.current = true;
                  
                  // Update input text safely with additional validation
                  if (isMountedRef.current) {
                    try {
                      // Validate text is a string and within limits
                      const safeText = typeof text === 'string' ? text.substring(0, 500) : '';
                      setInputText(safeText);
                    } catch (setStateError) {
                      console.error("WingmanChat: Error in setInputText:", setStateError);
                      console.error("WingmanChat: setInputText error stack:", setStateError.stack);
                      throw setStateError; // Re-throw to be caught by outer catch
                    }
                  }
                  
                  // Clear typing flag after a short delay
                  typingTimeoutRef.current = setTimeout(() => {
                    try {
                      // Check mount status before accessing refs
                      if (!isMountedRef.current) {
                        console.log("WingmanChat: Typing timeout fired but component unmounted");
                        return;
                      }

                      isTypingRef.current = false;
                      
                      // Scroll if we were supposed to scroll during typing
                      if (shouldScrollRef.current && isMountedRef.current) {
                        shouldScrollRef.current = false;
                        scrollToEndSafely();
                      }
                    } catch (timeoutError) {
                      console.error("WingmanChat: Error in typing timeout:", timeoutError);
                      console.error("WingmanChat: Timeout error stack:", timeoutError.stack);
                    } finally {
                      typingTimeoutRef.current = null;
                    }
                  }, 500);
                } catch (error) {
                  console.error("WingmanChat: CRITICAL ERROR in onChangeText:", error);
                  console.error("WingmanChat: onChangeText error stack:", error.stack);
                  console.error("WingmanChat: Error details:", {
                    textLength: text?.length,
                    isMounted: isMountedRef.current,
                    hasFlatListRef: !!flatListRef.current,
                  });
                  isTypingRef.current = false;
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                  }
                }
              }}
              multiline
              maxLength={500}
              onFocus={() => {
                console.log("WingmanChat: TextInput focused");
                isTypingRef.current = true;
              }}
              onBlur={() => {
                try {
                  console.log("WingmanChat: TextInput blurred");
                  
                  // Clear typing timeout if it exists
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = null;
                  }

                  isTypingRef.current = false;
                  
                  // Scroll if needed after blur
                  if (shouldScrollRef.current && isMountedRef.current) {
                    shouldScrollRef.current = false;
                    // Clear any existing blur timeout
                    if (blurTimeoutRef.current) {
                      clearTimeout(blurTimeoutRef.current);
                    }
                    blurTimeoutRef.current = setTimeout(() => {
                      try {
                        if (isMountedRef.current) {
                          scrollToEndSafely();
                        }
                      } catch (blurError) {
                        console.error("WingmanChat: Error in blur timeout:", blurError);
                      } finally {
                        blurTimeoutRef.current = null;
                      }
                    }, 100);
                  }
                } catch (error) {
                  console.error("WingmanChat: Error in onBlur:", error);
                  console.error("WingmanChat: onBlur error stack:", error.stack);
                }
              }}
              onSelectionChange={() => {
                try {
                  // Keep typing flag active during selection changes
                  if (isMountedRef.current) {
                    isTypingRef.current = true;
                  }
                } catch (error) {
                  console.error("WingmanChat: Error in onSelectionChange:", error);
                }
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
  } catch (error) {
    console.error("WingmanChat: CRITICAL ERROR in render:", error);
    console.error("WingmanChat: Error stack:", error.stack);
    console.error("WingmanChat: Profile:", !!profile, "Session:", !!session);
    
    // Return error UI instead of crashing
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.background }}
        edges={[]}
      >
        <View className="flex-1 items-center justify-center bg-background p-6">
          <Text style={{ color: theme.text, fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            {error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log("WingmanChat: Retry button pressed");
              navigation.goBack();
            }}
            className="bg-primary px-6 py-3 rounded-xl"
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
