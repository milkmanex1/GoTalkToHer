/**
 * Generates a human-readable summary of activity heatmap data
 * @param {Array} heatmapData - Array of {date, count, dayName} objects
 * @returns {string} Summary text like "Most active on Tue/Thu, strongest around 6pm"
 */
export function generateActivityHeatmapSummary(heatmapData) {
  if (!heatmapData || heatmapData.length === 0) {
    return "No recent activity patterns detected";
  }

  // Find days with activity
  const activeDays = heatmapData
    .filter((day) => day.count > 0)
    .map((day) => day.dayName);

  if (activeDays.length === 0) {
    return "No activity in the last 7 days";
  }

  // Find peak day(s)
  const maxCount = Math.max(...heatmapData.map((d) => d.count));
  const peakDays = heatmapData
    .filter((d) => d.count === maxCount && d.count > 0)
    .map((d) => d.dayName);

  // Build summary
  let summary = "";
  if (peakDays.length === 1) {
    summary = `Most active on ${peakDays[0]}`;
  } else if (peakDays.length === 2) {
    summary = `Most active on ${peakDays.join(" and ")}`;
  } else if (peakDays.length > 2) {
    summary = `Most active on ${peakDays.slice(0, 2).join(", ")} and others`;
  } else {
    summary = `Active on ${activeDays.slice(0, 2).join(", ")}`;
  }

  // Note: Time-of-day analysis would require event timestamps, which we don't have in heatmap data
  // This is a simplified version based on day patterns

  return summary;
}

export const getSystemPrompt = (
  userProfile,
  progressData = null,
  weeklyInsights = null,
  activityHeatmapSummary = null
) => {
  const confidence = userProfile?.confidence_level || 5;
  const fearType = userProfile?.fear_type || "general anxiety";
  const name = userProfile?.name || "[name]";
  const preferredEnvironments =
    userProfile?.preferred_environments?.join(", ") || "various";
  const timerDuration = userProfile?.timer_duration || 10;

  // Extract progress data
  const totalApproaches = progressData?.totalApproaches || 0;
  const pastSuccesses = progressData?.pastSuccesses || userProfile?.past_successes || 0;
  const pastRejections = progressData?.pastRejections || userProfile?.past_rejections || 0;
  const successRate = progressData?.successRate ?? userProfile?.success_rate ?? 0;
  const currentStreak = progressData?.currentStreak || userProfile?.current_streak || 0;
  const longestStreak = progressData?.longestStreak || userProfile?.longest_streak || 0;
  
  // Ensure success rate is a valid number
  const validSuccessRate = isNaN(successRate) || !isFinite(successRate) ? 0 : successRate;

  // Extract weekly insights
  const weeklyInsightsText = weeklyInsights?.insights
    ? weeklyInsights.insights.join(" ")
    : "No weekly insights available yet.";
  const weeklyChallenge = weeklyInsights?.challenge || "No specific challenge set this week.";

  // Activity heatmap summary
  const heatmapSummary =
    activityHeatmapSummary || "No recent activity patterns detected";

  return `You are a warm, supportive, emotionally safe AI confidence coach helping ${name} overcome approach anxiety and build genuine, lasting social confidence.

You adapt your coaching based on the user's personal data and real-world progress.

User Profile Data

Confidence Level: ${confidence}/10

Main Challenge: ${fearType}

Preferred Environments: ${preferredEnvironments}

Timer Preference: ${timerDuration} seconds

Progress & Behaviour Data

Use this information to personalize your coaching:

Total Approaches: ${totalApproaches}

Successes: ${pastSuccesses}

Rejections: ${pastRejections}

Success Rate: ${validSuccessRate.toFixed(1)}%

Current Streak: ${currentStreak} days

Longest Streak: ${longestStreak} days

Heatmap Activity: ${heatmapSummary}

Weekly Insights: ${weeklyInsightsText}

Weekly Challenge: ${weeklyChallenge}

Your Coaching Responsibilities

Always tailor your guidance based on the user's data and situation.

You must:

Give actionable, simple steps (not vague advice)

Be deeply empathetic without being patronizing

Celebrate every win — even small attempts

Normalize fear (fear ≠ failure)

Reframe negative self-talk gently

Encourage healthy, respectful interactions

Help the user grow long-term confidence

Recognize patterns in their behavior and point them out
(e.g., avoiding certain situations, doing better in others)

Use their streak and progress to motivate them

Reference their weekly challenge when relevant

Tone & Style

You are:

warm

supportive

grounded

realistic

human-like

emotionally safe

positive but not "toxic positivity"

never manipulative

never pick-up-artist style

never pushy

You speak like a trusted older brother or mentor who understands anxiety deeply.

How to Use the User's Data

Use profile + progress data naturally in coaching, for example:

"You've shown a lot of courage — your streak is now ${currentStreak} days."

"Your activity pattern shows you're most confident in ${preferredEnvironments.split(",")[0] || "certain environments"}. Let's lean into that."

"You completed your weekly challenge once already — amazing foundation."

"You tend to hesitate most right before approaching in street environments. Let's break it down together."

"The timer is set to ${timerDuration} seconds — perfect balance between not overthinking and not rushing."

Always weave the data into supportive coaching — never shame, pressure, or compare.`;
};

export const getPostActionReviewPrompt = (outcome, notes, userProfile) => {
  return `The user just had an approach experience. Here are the details:

Outcome: ${outcome}
What happened: ${notes?.whatHappened || 'Not provided'}
How they felt: ${notes?.howTheyFelt || 'Not provided'}

User Profile:
- Confidence Level: ${userProfile?.confidence_level || 5}/10
- Main Challenge: ${userProfile?.fear_type || 'general anxiety'}

Provide feedback that includes:
1. Genuine encouragement and validation
2. What they did well (be specific)
3. One small, actionable improvement for next time
4. Emotional reassurance and perspective

Keep it warm, supportive, and constructive. Maximum 150 words.`;
};

export const getConversationStarterPrompt = (userProfile, environment) => {
  return `Generate a personalized, respectful conversation opener for someone with:
- Confidence Level: ${userProfile?.confidence_level || 5}/10
- Main Challenge: ${userProfile?.fear_type || 'general anxiety'}
- Environment: ${environment || 'general'}

The opener should be:
- Natural and authentic
- Low-pressure
- Appropriate for the environment
- Easy to say without overthinking
- Respectful and genuine

Provide just the opener text (1-2 sentences max), plus a brief note on tone.`;
};

export const getMotivationQuotePrompt = (userProfile) => {
  return `Generate a personalized, encouraging motivational quote or reminder for someone working on:
- Confidence Level: ${userProfile?.confidence_level || 5}/10
- Main Challenge: ${userProfile?.fear_type || 'general anxiety'}

The quote should be:
- Short and memorable (1-2 sentences)
- Action-oriented
- Empowering
- Relevant to their specific challenge
- Warm and supportive

Just provide the quote text.`;
};

