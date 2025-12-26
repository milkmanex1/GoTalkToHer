# Debugging Crashes in Wingman Chat Screen

## Issues Fixed

I've identified and fixed several potential crash causes:

### 1. **Key Extractor Issue (CRITICAL)**
   - **Problem**: Using `index` as the key in FlatList can cause React Native to crash when items are added/removed
   - **Fix**: Changed to use unique message IDs (`item.id`) instead of index
   - **Impact**: This was likely the main cause of crashes when typing

### 2. **Missing Null Checks**
   - **Problem**: Messages could be null/undefined, causing Text component crashes
   - **Fix**: Added validation in ChatMessage component and FlatList renderItem
   - **Impact**: Prevents crashes from invalid data

### 3. **Unsafe Scroll Operations**
   - **Problem**: `scrollToEnd()` calls could crash if FlatList wasn't ready
   - **Fix**: Added safe scroll function with try-catch and timeout checks
   - **Impact**: Prevents crashes during auto-scroll

### 4. **State Update Errors**
   - **Problem**: State updates could fail silently and cause cascading errors
   - **Fix**: Added try-catch blocks around all state updates
   - **Impact**: Better error handling and logging

### 5. **Enhanced Logging**
   - **Problem**: No logs when crashes occurred
   - **Fix**: Added comprehensive console logging throughout the component
   - **Impact**: You can now see what's happening before crashes

## How to Debug Crashes in Expo Go

### Method 1: Check Metro Bundler Terminal
When a crash occurs, check your terminal where you ran `expo start`. Look for:
- Red error messages
- Stack traces
- Console.log outputs (now prefixed with "WingmanChat:")

### Method 2: Enable Remote Debugging
1. Shake your device (or press `Cmd+D` on iOS simulator / `Cmd+M` on Android)
2. Select "Debug Remote JS"
3. Open Chrome DevTools (usually opens automatically)
4. Check the Console tab for errors

### Method 3: Use React Native Debugger
1. Install React Native Debugger: `npm install -g react-native-debugger`
2. Open it before starting Expo
3. Connect your app (shake device → "Debug Remote JS")
4. You'll see detailed logs and can set breakpoints

### Method 4: Check Device Logs (Android)
```bash
# Connect your Android device via USB
adb logcat | grep -i "reactnative\|expo\|error"
```

### Method 5: Check Device Logs (iOS)
```bash
# Connect your iOS device via USB
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"' --level debug
```

## What to Look For

When typing causes a crash, check logs for:

1. **"WingmanChat:" prefixed logs** - These show the flow of operations
2. **"Error updating messages"** - State update failures
3. **"Error scrolling to end"** - Scroll operation failures
4. **"Error rendering message"** - Rendering issues
5. **"Invalid message item"** - Data corruption

## Common Crash Scenarios

### Scenario 1: Memory Issues
**Symptoms**: App crashes after typing for a while
**Solution**: The fixes I made should help, but if it persists:
- Check if messages array is growing too large (should be limited to 30)
- Monitor memory usage in React Native Debugger

### Scenario 2: Keyboard Issues
**Symptoms**: Crashes when keyboard appears/disappears
**Solution**: Already fixed with KeyboardAvoidingView improvements

### Scenario 3: Network Issues
**Symptoms**: Crashes when sending messages
**Solution**: Error handling is now in place, but check network connectivity

### Scenario 4: Expo Go Limitations
**Symptoms**: Crashes that don't show up in logs
**Solution**: This might be an Expo Go limitation. Consider:
- Building a development build: `eas build --profile development`
- Testing on a physical device instead of simulator

## Testing the Fixes

1. **Clear app data**: Uninstall and reinstall Expo Go, or clear app data
2. **Start fresh**: Restart Metro bundler: `npx expo start --clear`
3. **Test typing**: Type various messages, including:
   - Short messages
   - Long messages (up to 500 chars)
   - Special characters
   - Emojis
   - Rapid typing
4. **Monitor logs**: Keep terminal open and watch for errors

## If Crashes Persist

1. **Check Expo Go version**: Update to latest: `npx expo install expo`
2. **Check React Native version**: Ensure compatibility
3. **Try development build**: Expo Go has limitations; a dev build gives better error reporting
4. **Check device memory**: Low memory can cause crashes
5. **Report with logs**: If crashes continue, share the terminal logs

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
2. Monitor the terminal for "WingmanChat:" logs
3. If crashes occur, note what you were doing and check logs
4. Share logs if you need further help

The enhanced logging should now show you exactly what's happening before a crash occurs.

