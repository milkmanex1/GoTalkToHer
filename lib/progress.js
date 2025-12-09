import { supabase } from "./supabase";

/**
 * Updates the user's progress stats when an approach or timer is completed
 * @param {string} authUserId - The authenticated user's ID
 * @param {string} type - Either 'approach' or 'timer'
 * @param {string} outcome - For approaches: 'got_number', 'friendly', 'not_interested', etc. For timers: 'timer_completed'
 * @returns {Promise<void>}
 */
export async function updateProgress(authUserId, type, outcome = null) {
  try {
    // Load current profile
    const { data: profile, error: fetchError } = await supabase
      .from("user_profile")
      .select("*")
      .eq("id", authUserId)
      .single();

    if (fetchError || !profile) {
      console.error("Error fetching profile:", fetchError);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Prepare update object
    const updates = {};

    // Only update streak and last_approach_date for approaches, not timers
    if (type === "approach") {
      // Get last approach date
      let lastApproachDate = null;
      if (profile.last_approach_date) {
        lastApproachDate = new Date(profile.last_approach_date);
        lastApproachDate.setHours(0, 0, 0, 0);
      }

      // Calculate streak
      let currentStreak = profile.current_streak || 0;
      let longestStreak = profile.longest_streak || 0;

      if (lastApproachDate) {
        const daysDiff = Math.floor(
          (today - lastApproachDate) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          // Same day - no streak change
          // Keep current streak
        } else if (daysDiff === 1) {
          // Exactly next day - increment streak
          currentStreak = (profile.current_streak || 0) + 1;
        } else {
          // More than 1 day gap - reset streak to 1
          currentStreak = 1;
        }
      } else {
        // First time - start streak at 1
        currentStreak = 1;
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      updates.last_approach_date = today.toISOString();
      updates.current_streak = currentStreak;
      updates.longest_streak = longestStreak;
    }

    // Increment counters based on type
    if (type === "approach") {
      updates.total_approaches = (profile.total_approaches || 0) + 1;

      // Update success/rejection counters (if outcome provided)
      if (outcome === "got_number" || outcome === "friendly") {
        updates.past_successes = (profile.past_successes || 0) + 1;
      } else if (outcome === "not_interested") {
        updates.past_rejections = (profile.past_rejections || 0) + 1;
      }
    } else if (type === "timer") {
      updates.timer_runs = (profile.timer_runs || 0) + 1;
    }

    // Calculate success rate
    const totalApproaches = updates.total_approaches || profile.total_approaches || 0;
    const pastSuccesses = updates.past_successes || profile.past_successes || 0;
    
    if (totalApproaches > 0) {
      updates.success_rate = (pastSuccesses / totalApproaches) * 100;
    } else {
      updates.success_rate = 0;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("user_profile")
      .update(updates)
      .eq("id", authUserId);

    if (updateError) {
      console.error("Error updating progress:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("Error in updateProgress:", error);
    throw error;
  }
}

/**
 * Gets the user's progress stats
 * @param {string} authUserId - The authenticated user's ID
 * @returns {Promise<Object|null>} Progress stats object or null if error
 */
export async function getProgress(authUserId) {
  try {
    const { data: profile, error } = await supabase
      .from("user_profile")
      .select(
        "total_approaches, timer_runs, current_streak, longest_streak, last_approach_date, success_rate, past_successes"
      )
      .eq("id", authUserId)
      .single();

    if (error || !profile) {
      console.error("Error fetching progress:", error);
      return null;
    }

    return {
      totalApproaches: profile.total_approaches || 0,
      timerRuns: profile.timer_runs || 0,
      currentStreak: profile.current_streak || 0,
      longestStreak: profile.longest_streak || 0,
      lastApproachDate: profile.last_approach_date,
      successRate: profile.success_rate || 0,
      pastSuccesses: profile.past_successes || 0,
    };
  } catch (error) {
    console.error("Error in getProgress:", error);
    return null;
  }
}

/**
 * Gets activity data for the last 7 days for heatmap
 * @param {string} authUserId - The authenticated user's ID
 * @returns {Promise<Array>} Array of 7 objects with date and count
 */
export async function getActivityHeatmap(authUserId) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Last 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get all approach events from last 7 days
    const { data: events, error } = await supabase
      .from("approach_events")
      .select("created_at, timer_completed, outcome")
      .eq("user_id", authUserId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching activity:", error);
      return [];
    }

    // Initialize array for last 7 days
    const heatmapData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split("T")[0];
      const count = events.filter((event) => {
        const eventDate = new Date(event.created_at);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === date.getTime();
      }).length;

      heatmapData.push({
        date: dateStr,
        count: count,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return heatmapData;
  } catch (error) {
    console.error("Error in getActivityHeatmap:", error);
    return [];
  }
}

