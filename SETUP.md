# Setup Guide

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn
3. Expo CLI (`npm install -g expo-cli`)
4. Supabase account (already configured)
5. OpenAI API key (already configured)

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase Database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL script to create all tables

3. **Configure Assets** (Optional)
   - Add app icon: `assets/icon.png` (1024x1024)
   - Add splash screen: `assets/splash.png` (1242x2436)
   - Add adaptive icon: `assets/adaptive-icon.png` (1024x1024)
   - Add favicon: `assets/favicon.png` (48x48)
   - Add notification icon: `assets/notification-icon.png` (96x96)

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Run on Device/Emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app on physical device

## API Configuration

API keys are configured in `app.json` under the `extra` section. For production, consider:
- Using environment variables
- Storing keys securely
- Implementing proper authentication

## Database Schema

The app uses three main tables:
- `user_profile` - Stores user onboarding data
- `approach_events` - Stores timer events and post-action reviews
- `chat_messages` - Stores chat history with AI

See `supabase-schema.sql` for full schema details.

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### NativeWind not working
- Ensure `babel.config.js` includes NativeWind plugin
- Check `tailwind.config.js` content paths
- Verify `global.css` is imported in `App.js`

### Supabase connection issues
- Verify API keys in `app.json`
- Check Supabase project status
- Ensure RLS policies allow operations

### OpenAI API errors
- Verify API key is valid
- Check API quota/limits
- Ensure model access (GPT-4)

## Next Steps

1. Test all features
2. Add app icons and splash screens
3. Configure push notifications (requires device)
4. Test on physical devices
5. Prepare for app store submission

