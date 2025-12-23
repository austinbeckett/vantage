# Settings

## Overview

Central configuration hub where users manage their account, notification preferences, and application settings. Provides control over how Vantage communicates with users and displays information.

## User Flows

- View and edit profile information (name, email)
- Change password with current password verification
- Configure email notification frequency (instant, daily digest, weekly)
- Set quiet hours for notifications
- Toggle notification types on/off
- Switch theme (light, dark, system)
- Set timezone preference
- Log out of account

## Components Provided

- `Settings.tsx` — Main settings page with tabbed sections

## Callback Props

| Callback | Description |
|----------|-------------|
| `onUpdateProfile` | Called when user saves profile changes |
| `onChangePassword` | Called when user changes password |
| `onUpdateNotifications` | Called when notification settings change |
| `onUpdatePreferences` | Called when app preferences change |
| `onLogout` | Called when user logs out |

## Visual Reference

See `screenshot.png` for the target UI design (if available).

## Data Used

**From types.ts:**
- `UserProfile` — User profile data
- `NotificationSettings` — Email and notification preferences
- `AppPreferences` — Theme, timezone, default view

**From global model:**
- User entity
