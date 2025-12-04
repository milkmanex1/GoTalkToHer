# Go Talk To Her - AI-Powered Confidence Coach

A React Native mobile app built with Expo that helps users overcome approach anxiety and build confidence in social interactions.

## Features

- **Onboarding**: Collect user profile (name, age, confidence level, challenges)
- **Approach Timer**: Countdown timer with haptic feedback to encourage action
- **Conversation Starters**: Categorized openers with AI-generated personalized suggestions
- **Motivation Boost**: Inspirational quotes with AI-generated personalized quotes
- **Post-Action Review**: Reflect on experiences with AI feedback
- **Wingman AI Chat**: Personalized coaching chat powered by OpenAI

## Tech Stack

- React Native (Expo)
- Supabase (Database & Auth)
- OpenAI API (AI Coaching)
- NativeWind (Tailwind CSS for React Native)
- MMKV (Local Storage)
- React Navigation

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase Database**
   - Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor
   - The API keys are already configured in `app.json`

3. **Start the App**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   ```

## Project Structure

```
/
├── App.js                 # Main app entry point
├── navigation/            # Navigation configuration
├── screens/              # All app screens
├── components/           # Reusable UI components
├── lib/                  # Core services (Supabase, OpenAI, Storage, etc.)
└── supabase-schema.sql   # Database schema

```

## Environment Variables

API keys are configured in `app.json` under `extra`. For production, consider using environment variables.

## Notes

- The app uses Supabase for data storage
- OpenAI GPT-4 is used for AI coaching features
- Notifications are set up for daily motivational reminders
- Timer sound file is optional (currently disabled)

## License

Private project

