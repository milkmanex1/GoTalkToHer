import { supabase } from "./supabase";

/**
 * Generates weekly insights and personalized challenge based on user's recent activity
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} Object with insights array and challenge string
 */
export async function generateWeeklyInsights(userId) {
  try {
    // Get date range for last 7-14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch user profile stats
    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("total_approaches, timer_runs, current_streak, success_rate")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    // Fetch approach events from last 14 days
    const { data: events, error: eventsError } = await supabase
      .from("approach_events")
      .select("created_at, timer_started_at, timer_completed, outcome")
      .eq("user_id", userId)
      .gte("created_at", fourteenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    // Analyze patterns
    const insights = [];
    const totalApproaches = profile?.total_approaches || 0;
    const timerRuns = profile?.timer_runs || 0;
    const successRate = profile?.success_rate || 0;
    const currentStreak = profile?.current_streak || 0;

    // Filter events from last 7 days for more recent patterns
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentEvents = events.filter((event) => {
      const eventDate = new Date(event.created_at);
      return eventDate >= sevenDaysAgo;
    });

    // Pattern 1: High timer runs, low approaches
    const recentTimerRuns = recentEvents.filter(
      (e) => e.timer_completed === true && (!e.outcome || e.outcome === "timer_completed")
    ).length;
    const recentApproaches = recentEvents.filter(
      (e) => e.outcome && e.outcome !== "timer_completed" && e.outcome !== "did_not_approach"
    ).length;

    if (recentTimerRuns > 0 && recentApproaches === 0) {
      insights.push(
        "You start strong but hesitate at the final moment. Completing timers is great—now take that momentum into action."
      );
    } else if (recentTimerRuns > recentApproaches * 2 && recentApproaches > 0) {
      insights.push(
        "You're practicing courage with timers, but you're not converting them into approaches. Try committing to one approach per timer session."
      );
    }

    // Pattern 2: Time of day analysis
    const hourCounts = {};
    recentEvents.forEach((event) => {
      const hour = new Date(event.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const hourKeys = Object.keys(hourCounts);
    const peakHour = hourKeys.length > 0
      ? hourKeys.reduce((a, b) =>
          hourCounts[a] > hourCounts[b] ? a : b
        )
      : null;

    if (peakHour && hourCounts[peakHour] >= 2) {
      const hourNum = parseInt(peakHour);
      if (hourNum >= 17) {
        insights.push(
          "Your courage peaks after 5pm. Try to schedule your approaches during evening hours when you're naturally more confident."
        );
      } else if (hourNum >= 12 && hourNum < 17) {
        insights.push(
          "You're most active during afternoon hours. This is a great time for approaches—people are relaxed and open to conversation."
        );
      } else {
        insights.push(
          "You're taking action in the morning. Early approaches can set a positive tone for your entire day."
        );
      }
    }

    // Pattern 3: Freezing pattern (timer completed but no approach)
    const freezingEvents = recentEvents.filter(
      (e) => e.timer_completed === true && (!e.outcome || e.outcome === "did_not_approach")
    ).length;

    if (freezingEvents > 0) {
      insights.push(
        `You froze ${freezingEvents} time${freezingEvents > 1 ? "s" : ""} recently. Freezing is completely normal—it's your brain's way of protecting you. A smaller warm-up challenge may help build momentum.`
      );
    }

    // Pattern 4: Success rate analysis
    if (totalApproaches > 0) {
      if (successRate >= 50) {
        insights.push(
          `Your success rate is ${successRate.toFixed(0)}%—you're doing great! Keep building on this momentum.`
        );
      } else if (successRate > 0 && successRate < 30) {
        insights.push(
          "Your success rate shows you're taking action, but there's room to improve. Focus on reading body language and adjusting your approach style."
        );
      }
    }

    // Pattern 5: Streak analysis
    if (currentStreak > 0) {
      insights.push(
        `You're on a ${currentStreak}-day streak! Consistency is building your confidence muscle. Keep it going.`
      );
    } else if (totalApproaches > 0) {
      insights.push(
        "You've taken action before, but your streak has reset. Starting fresh is okay—every day is a new opportunity to build momentum."
      );
    }

    // Pattern 6: Low activity overall
    if (recentEvents.length === 0 && totalApproaches === 0) {
      insights.push(
        "You're just getting started. Every expert was once a beginner. Start with one small action this week."
      );
    } else if (recentEvents.length === 0 && totalApproaches > 0) {
      insights.push(
        "You haven't been active recently, but you've taken action before. Remember that feeling of courage—you can do it again."
      );
    }

    // Ensure we have at least 2 insights, maximum 4
    if (insights.length === 0) {
      insights.push(
        "You're building your approach skills. Keep practicing and tracking your progress."
      );
      insights.push(
        "Consistency beats intensity. Small daily actions compound into significant growth."
      );
    } else if (insights.length > 4) {
      insights.splice(4);
    }

    // Generate personalized challenge
    const challenge = selectPersonalizedChallenge(
      totalApproaches,
      timerRuns,
      recentApproaches,
      recentTimerRuns,
      freezingEvents,
      currentStreak
    );

    // Save to database
    const { error: insertError } = await supabase
      .from("weekly_insights")
      .insert([
        {
          user_id: userId,
          insights: JSON.stringify(insights),
          challenge: challenge,
          generated_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("Error saving insights:", insertError);
      throw insertError;
    }

    return {
      insights: insights,
      challenge: challenge,
    };
  } catch (error) {
    console.error("Error generating weekly insights:", error);
    throw error;
  }
}

/**
 * Selects a personalized challenge based on user patterns
 */
function selectPersonalizedChallenge(
  totalApproaches,
  timerRuns,
  recentApproaches,
  recentTimerRuns,
  freezingEvents,
  currentStreak
) {
  const challenges = [
    "Do 1 friendliness warm-up (say hi to anyone).",
    "Try 1 café approach this week.",
    "Aim for 2 attempts this week.",
    "Complete one approach using the 5-second timer.",
    "Try a street approach from the side.",
  ];

  // If user freezes a lot, suggest warm-up
  if (freezingEvents >= 2) {
    return challenges[0];
  }

  // If user has low approaches, suggest specific count
  if (totalApproaches < 3) {
    return challenges[2]; // "Aim for 2 attempts this week."
  }

  // If user has many timer runs but few approaches, suggest timer-based approach
  if (recentTimerRuns > recentApproaches * 2) {
    return challenges[3]; // "Complete one approach using the 5-second timer."
  }

  // If user has good activity, suggest café (structured environment)
  if (totalApproaches >= 3 && currentStreak > 0) {
    return challenges[1]; // "Try 1 café approach this week."
  }

  // Default: street approach
  return challenges[4];
}

/**
 * Ensures weekly insights are generated if needed (checks if last insight is older than 7 days)
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object|null>} Latest insights object or null if error
 */
export async function ensureWeeklyInsightsGenerated(userId) {
  try {
    // Get most recent insight
    const { data: latestInsight, error: fetchError } = await supabase
      .from("weekly_insights")
      .select("generated_at, insights, challenge")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - that's okay
      console.error("Error fetching latest insight:", fetchError);
      throw fetchError;
    }

    const now = new Date();
    let shouldGenerate = false;

    if (!latestInsight) {
      // No insights exist - generate immediately
      shouldGenerate = true;
    } else {
      // Check if older than 7 days
      const generatedAt = new Date(latestInsight.generated_at);
      const daysDiff = (now - generatedAt) / (1000 * 60 * 60 * 24);

      if (daysDiff >= 7) {
        shouldGenerate = true;
      }
    }

    if (shouldGenerate) {
      // Generate new insights
      return await generateWeeklyInsights(userId);
    } else {
      // Return existing insights
      if (latestInsight) {
        return {
          insights: JSON.parse(latestInsight.insights),
          challenge: latestInsight.challenge,
        };
      }
      return null;
    }
  } catch (error) {
    console.error("Error ensuring weekly insights:", error);
    throw error;
  }
}

/**
 * Gets the latest weekly insights for a user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object|null>} Latest insights object or null if not found
 */
export async function getLatestWeeklyInsights(userId) {
  try {
    const { data: latestInsight, error } = await supabase
      .from("weekly_insights")
      .select("generated_at, insights, challenge")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching latest insight:", error);
      throw error;
    }

    return {
      insights: JSON.parse(latestInsight.insights),
      challenge: latestInsight.challenge,
      generatedAt: latestInsight.generated_at,
    };
  } catch (error) {
    console.error("Error getting latest weekly insights:", error);
    throw error;
  }
}

