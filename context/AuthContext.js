import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

      setProfile(data);
    } catch (err) {
      console.error("Error loading profile:", err);
      setProfile(null);
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
        const { data: { session: initialSession }, error: sessionError } = 
          await supabase.auth.getSession();

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

      setSession(newSession);

      // Reload profile when session changes
      if (newSession?.user?.id) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
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

