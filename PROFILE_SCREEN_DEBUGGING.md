# Debugging Profile Screen Crashes

## Issues Fixed

I've identified and fixed several potential crash causes in ProfileScreen:

### 1. **Activity Heatmap Rendering (CRITICAL)**
   - **Problem**: The activity heatmap could crash if:
     - `activityData` contained null/undefined elements
     - `day` objects were malformed
     - `theme.textSecondaryRgba` was called incorrectly
   - **Fix**: Added comprehensive null checks, type validation, and error handling
   - **Impact**: Prevents crashes when rendering the activity heatmap

### 2. **Missing Null Checks**
   - **Problem**: Profile data could be null/undefined during hydration
   - **Fix**: Added validation checks before accessing profile properties
   - **Impact**: Prevents crashes from invalid data

### 3. **Enhanced Logging**
   - **Problem**: No logs when crashes occurred
   - **Fix**: Added comprehensive console logging throughout the component
   - **Impact**: You can now see what's happening before crashes

## How to See Logs in Expo Go

### Method 1: Check Metro Bundler Terminal (EASIEST)
When a crash occurs, check your terminal where you ran `expo start` or `npx expo start`. Look for:
- Red error messages
- Stack traces
- Console.log outputs (now prefixed with "ProfileScreen:")

**To see logs:**
1. Keep your terminal window visible
2. Look for messages starting with "ProfileScreen:"
3. Red text indicates errors

### Method 2: Enable Remote Debugging
1. Shake your device (or press `Cmd+D` on iOS simulator / `Cmd+M` on Android)
2. Select "Debug Remote JS"
3. Open Chrome DevTools (usually opens automatically at http://localhost:8081/debugger-ui)
4. Check the Console tab for errors and logs
5. You'll see all `console.log` and `console.error` messages here

### Method 3: Use React Native Debugger
1. Install React Native Debugger: `npm install -g react-native-debugger`
2. Open it before starting Expo
3. Connect your app (shake device → "Debug Remote JS")
4. You'll see detailed logs and can set breakpoints

### Method 4: Check Device Logs (Android)
```bash
# Connect your Android device via USB
adb logcat | grep -i "reactnative\|expo\|error\|ProfileScreen"
```

### Method 5: Check Device Logs (iOS)
```bash
# Connect your iOS device via USB or use simulator
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"' --level debug
```

## What to Look For

When navigating to Profile causes a crash, check logs for:

1. **"ProfileScreen:" prefixed logs** - These show the flow of operations:
   - "Component rendering" - Component is mounting
   - "Profile changed" - Profile data updated
   - "Loading activity data" - Fetching activity data
   - "Rendering profile content" - About to render main content

2. **"Error loading activity data"** - Database/API failures
3. **"Error rendering activity heatmap"** - Rendering issues
4. **"Error getting backgroundColor"** - Theme/color issues
5. **"ERROR BOUNDARY CAUGHT ERROR"** - React error boundary caught something

## Common Crash Scenarios

### Scenario 1: Profile Data Not Loaded
**Symptoms**: App crashes immediately when navigating to Profile
**Solution**: The loading check should prevent this, but check logs for "ready:", "session:", "profile:" values

### Scenario 2: Activity Data Issues
**Symptoms**: Crashes when rendering the activity heatmap
**Solution**: Already fixed with null checks and error handling. Check logs for "Error rendering activity heatmap"

### Scenario 3: Theme/Color Issues
**Symptoms**: Crashes related to colors
**Solution**: Added fallback for `textSecondaryRgba`. Check logs for "Error getting backgroundColor"

### Scenario 4: Expo Go Limitations
**Symptoms**: Crashes that don't show up in logs
**Solution**: This might be an Expo Go limitation. Consider:
- Building a development build: `eas build --profile development`
- Testing on a physical device instead of simulator
- Using remote debugging (Method 2 above)

## Testing the Fixes

1. **Clear app data**: Uninstall and reinstall Expo Go, or clear app data
2. **Start fresh**: Restart Metro bundler: `npx expo start --clear`
3. **Navigate to Profile**: Go to the Profile screen
4. **Monitor logs**: Keep terminal open and watch for:
   - "ProfileScreen: Component rendering"
   - "ProfileScreen: Auth state - ready: true..."
   - "ProfileScreen: Loading activity data..."
   - Any red error messages

## If Crashes Persist

1. **Check Expo Go version**: Update to latest: `npx expo install expo`
2. **Check React Native version**: Ensure compatibility
3. **Try development build**: Expo Go has limitations; a dev build gives better error reporting
4. **Check device memory**: Low memory can cause crashes
5. **Report with logs**: If crashes continue, share the terminal logs (especially the red error messages)

## Additional Debugging Commands

```bash
# Clear Metro cache
npx expo start --clear

# Check for dependency issues
npm ls

# Update Expo
npx expo install expo@latest

# Check React Native version
npx react-native --version
```

## Next Steps

1. Test the app with the fixes applied
2. Monitor the terminal for "ProfileScreen:" logs
3. If crashes occur, note what you were doing and check logs
4. Share logs if you need further help

The enhanced logging should now show you exactly what's happening before a crash occurs.

