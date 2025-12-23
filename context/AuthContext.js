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

    setLoading(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("⚡ AUTH STATE CHANGE EVENT:", event);
      console.log(
        "⚡ UPDATED SESSION USER ID:",
        session?.user?.id || "NO SESSION"
      );

      setSession(session);

      if (session?.user?.id) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setReady(true);
      setLoading(false);
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
