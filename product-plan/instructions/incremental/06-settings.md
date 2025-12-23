# Milestone 6: Settings

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement Settings — the central configuration hub for account management, notification preferences, and application settings.

## Overview

Settings allows users to manage their profile, control how Vantage communicates with them (Pulse notifications), and customize the application experience.

**Key Functionality:**
- View and edit profile information (name, email)
- Change password
- Configure email notification frequency (instant, daily digest, weekly)
- Set quiet hours for notifications
- Toggle notification types on/off
- Switch theme (light, dark, system)
- Set timezone preference
- Configure default startup view
- Log out

## Recommended Approach: Test-Driven Development

See `product-plan/sections/settings/tests.md` for detailed test-writing instructions.

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy from `product-plan/sections/settings/components/`:

- `Settings.tsx` — Main settings page with tabbed sections

### Data Layer

```typescript
interface SettingsProps {
  user: UserProfile
  notificationSettings: NotificationSettings
  preferences: AppPreferences
  onUpdateProfile?: (profile: Partial<UserProfile>) => void
  onChangePassword?: (currentPassword: string, newPassword: string) => void
  onUpdateNotifications?: (settings: Partial<NotificationSettings>) => void
  onUpdatePreferences?: (prefs: Partial<AppPreferences>) => void
  onLogout?: () => void
}
```

You'll need to:
- Create user profile CRUD API
- Implement secure password change
- Store notification preferences
- Persist app preferences (theme, timezone)
- Implement logout functionality

### Callbacks

| Callback | Description |
|----------|-------------|
| `onUpdateProfile` | Save profile changes |
| `onChangePassword` | Change user password |
| `onUpdateNotifications` | Update notification settings |
| `onUpdatePreferences` | Update app preferences |
| `onLogout` | Log user out and redirect |

### Validation

- Email must be valid format
- Password change requires current password
- New password must meet strength requirements

## Files to Reference

- `product-plan/sections/settings/README.md`
- `product-plan/sections/settings/tests.md`
- `product-plan/sections/settings/components/`
- `product-plan/sections/settings/types.ts`
- `product-plan/sections/settings/sample-data.json`
- `product-plan/sections/settings/screenshot.png`

## Expected User Flows

### Flow 1: Update Profile

1. User navigates to Settings
2. User edits name or email in Profile section
3. User clicks Save
4. **Outcome:** Profile updates, success message shown

### Flow 2: Change Password

1. User clicks "Change Password"
2. User enters current password
3. User enters and confirms new password
4. User clicks Save
5. **Outcome:** Password changed, confirmation shown

### Flow 3: Configure Notifications

1. User navigates to Notifications tab
2. User selects "Daily Digest" instead of "Instant"
3. User sets quiet hours (10pm - 7am)
4. User saves changes
5. **Outcome:** Notification preferences saved

### Flow 4: Switch Theme

1. User goes to Preferences tab
2. User selects "Dark" theme
3. App immediately switches to dark mode
4. **Outcome:** Theme persists across sessions

### Flow 5: Log Out

1. User clicks Logout
2. User confirms logout (if confirmation needed)
3. **Outcome:** User logged out, redirected to login

## Done When

- [ ] Tests written for key user flows
- [ ] All tests pass
- [ ] Profile section displays and edits work
- [ ] Password change works with validation
- [ ] Notification settings persist
- [ ] Theme toggle works immediately
- [ ] Timezone selection works
- [ ] Logout works
- [ ] Success/error feedback shown
- [ ] Responsive on mobile
