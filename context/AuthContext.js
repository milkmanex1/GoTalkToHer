import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Storage } from "../lib/storage";

console.log("🔥 APP MOUNTED / AUTH CONTEXT INITIALIZED");

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  // Load profile from database
  const loadProfile = async (userId) => {
    try {
      const { data, error: profileError } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        // Profile doesn't exist
        if (profileError.code === "PGRST116") {
          setProfile(null);
          return;
        }
        throw profileError;
      }

      // Only set profile if data exists - never temporarily set to null once loaded
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      // Only set to null if there's an actual error, not during normal flow
      // This prevents profile from being temporarily null during hydration
      if (err.code !== "PGRST116") {
        // Only clear profile on actual errors, not "not found" which is expected
        setProfile(null);
      }
    }
  };

  // Refresh profile (called after onboarding or profile updates)
  const refresh = async () => {
    if (session?.user?.id) {
      await loadProfile(session.user.id);
    } else {
      setProfile(null);
    }
  };

  // Initial load on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get initial session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        // 🔥 DEBUG: Log full session data
        console.log(
          "🔥 AUTH SESSION USER ID:",
          initialSession?.user?.id || "NO SESSION"
        );
        console.log(
          "🔥 FULL SESSION DATA:",
          JSON.stringify(initialSession, null, 2)
        );

        if (sessionError) {
          throw sessionError;
        }

        if (mounted) {
          setSession(initialSession);

          // Load profile if session exists
          if (initialSession?.user?.id) {
            await loadProfile(initialSession.user.id);
          } else {
            setProfile(null);
          }

          // 🔥 DEBUG: Log stored user profile ID from Storage
          Storage.getUserId?.()
            .then((id) => {
              console.log("🔥 STORED USER PROFILE ID:", id || "NO STORED ID");
            })
            .catch((err) => {
              console.log(
                "🔥 STORED USER PROFILE ID: Storage.getUserId() not available or error:",
                err
              );
            });

          // ready becomes true only after session + profile are fully loaded
          // If session exists but no profile, still set ready (user needs onboarding)
          setReady(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) {
          setError(err);
          setSession(null);
          setProfile(null);
          setReady(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      // ⚡ DEBUG: Log auth state change events
      console.log("⚡ AUTH STATE CHANGE EVENT:", event);
      console.log(
        "⚡ UPDATED SESSION USER ID:",
        newSession?.user?.id || "NO SESSION"
      );

      setSession(newSession);

      // Reload profile when session changes
      // Only set profile to null on actual logout (SIGNED_OUT event)
      if (newSession?.user?.id) {
        await loadProfile(newSession.user.id);

        // 🔥 DEBUG: Log stored user profile ID after profile reload
        Storage.getUserId?.()
          .then((id) => {
            console.log(
              "🔥 STORED USER PROFILE ID (after auth change):",
              id || "NO STORED ID"
            );
          })
          .catch((err) => {
            console.log(
              "🔥 STORED USER PROFILE ID (after auth change): Storage.getUserId() not available or error:",
              err
            );
          });
      } else if (event === "SIGNED_OUT") {
        // Only clear profile on explicit sign out
        setProfile(null);
      }
      // Don't clear profile on other events to prevent temporary null states
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user || null,
    profile,
    loading,
    ready,
    error,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
