# Authentication & Onboarding Refactoring Summary

## Overview
This refactoring updates the app to use Supabase Auth `user.id` as the permanent identity, ensuring each authenticated user has exactly one profile in the `user_profile` table.

## Changes Made

### 1. Database Migration
**File:** `migrations/add-auth-user-id.sql`
- Added `auth_user_id` column to `user_profile` table
- Added unique constraint to ensure one profile per auth user
- Created index for better query performance

**Action Required:** Run the migration SQL in your Supabase SQL Editor before deploying the app.

### 2. Storage Helper Updates
**File:** `lib/storage.js`
- Added new methods: `getAuthUserId()`, `setAuthUserId()`, `removeAuthUserId()`
- Kept old methods (`getUserId`, `setUserId`) for backward compatibility (marked as deprecated)
- Changed storage key from `"userId"` to `"authUserId"`

### 3. OnboardingScreen
**File:** `screens/OnboardingScreen.js`
- Now checks for existing profile before creating a new one
- Gets authenticated user via `supabase.auth.getUser()`
- Inserts profile with `auth_user_id` field
- Skips onboarding if profile already exists

### 4. HomeScreen
**File:** `screens/HomeScreen.js`
- Loads profile using `auth_user_id` instead of `id`
- Checks for authenticated user first
- Redirects to Onboarding if no profile exists
- Redirects to Onboarding if not authenticated

### 5. All Other Screens Updated
Updated the following screens to use `auth_user_id`:
- **ApproachTimerScreen**: Uses `auth.user.id` for saving timer events
- **PostActionReviewScreen**: Loads profile by `auth_user_id`, updates stats using `auth_user_id`
- **MotivationBoostScreen**: Loads profile by `auth_user_id`
- **WingmanChatScreen**: Loads profile and chat history using `auth_user_id`
- **ConversationStartersScreen**: Loads profile by `auth_user_id`

### 6. App Navigation
**File:** `navigation/AppNavigator.js`
- Added auth state check on app launch
- Determines initial route based on:
  - No auth user → Onboarding
  - Auth user with profile → Home
  - Auth user without profile → Onboarding
- Shows loading screen while checking auth state

### 7. Database Schema
**File:** `supabase-schema.sql`
- Updated to include `auth_user_id` column
- Documented that `approach_events.user_id` and `chat_messages.user_id` now store `auth.users(id)` values

## Key Behavioral Changes

### Before:
- Every login created a new user profile
- Profile ID was stored in AsyncStorage
- Queries used `user_profile.id`

### After:
- Each Supabase Auth user has exactly one profile
- Onboarding checks for existing profile and skips if found
- Auth user ID is stored in AsyncStorage
- All queries use `auth_user_id` to find profiles
- Other tables (`approach_events`, `chat_messages`) use `auth.users(id)` directly

## Migration Steps

1. **Run Database Migration:**
   ```sql
   -- Run migrations/add-auth-user-id.sql in Supabase SQL Editor
   ```

2. **Update Existing Data (if needed):**
   If you have existing users, you'll need to migrate their data:
   ```sql
   -- Example: Link existing profiles to auth users
   -- UPDATE user_profile SET auth_user_id = <auth_user_id> WHERE id = <profile_id>;
   ```

3. **Test the Flow:**
   - Log in with an existing user → Should skip onboarding
   - Log in with a new user → Should show onboarding
   - Create profile → Should save with `auth_user_id`
   - Navigate to any screen → Should load correct profile

## Files Modified

- `lib/storage.js`
- `screens/OnboardingScreen.js`
- `screens/HomeScreen.js`
- `screens/ApproachTimerScreen.js`
- `screens/PostActionReviewScreen.js`
- `screens/MotivationBoostScreen.js`
- `screens/WingmanChatScreen.js`
- `screens/ConversationStartersScreen.js`
- `navigation/AppNavigator.js`
- `supabase-schema.sql`

## Files Created

- `migrations/add-auth-user-id.sql`
- `REFACTORING_SUMMARY.md` (this file)

## Notes

- The old `Storage.getUserId()` and `Storage.setUserId()` methods are still available but deprecated
- All screens now use `supabase.auth.getUser()` to get the authenticated user
- Profile lookups use `.eq('auth_user_id', authUserId)` instead of `.eq('id', userId)`
- Foreign key relationships in `approach_events` and `chat_messages` now reference `auth.users(id)` directly (enforced by app code)

