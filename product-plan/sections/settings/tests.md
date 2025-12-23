# Test Instructions: Settings

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## Overview

Settings is the central configuration hub where users manage their account, notification preferences, and application settings.

---

## User Flow Tests

### Flow 1: View Profile Section

**Scenario:** User views their profile information

**Steps:**
1. User navigates to `/settings`
2. Profile section is displayed (default tab)

**Expected Results:**
- [ ] Page title "Settings" displayed
- [ ] Profile section shows user's name
- [ ] Profile section shows user's email
- [ ] Edit button is available for profile fields

---

### Flow 2: Edit Profile Information

**Scenario:** User updates their display name

**Steps:**
1. User clicks "Edit" on profile section
2. User changes name to "New Name"
3. User clicks "Save"

**Expected Results:**
- [ ] Edit mode enables input fields
- [ ] Name field accepts text input
- [ ] "Save" and "Cancel" buttons appear
- [ ] Saving shows success message: "Profile updated"
- [ ] New name is displayed after save

#### Failure Path: Validation Error

**Setup:**
- User clears required field

**Expected Results:**
- [ ] Error shown: "Name is required"
- [ ] Save button disabled or shows error
- [ ] Focus moves to invalid field

---

### Flow 3: Change Password

**Scenario:** User changes their password

**Steps:**
1. User navigates to Profile section
2. User clicks "Change Password"
3. User enters current password
4. User enters new password (twice)
5. User submits

**Expected Results:**
- [ ] Change Password button/link visible
- [ ] Opens modal or inline form
- [ ] Requires current password
- [ ] New password field with confirmation
- [ ] Password strength indicator (optional)
- [ ] Success message: "Password changed"

#### Failure Path: Wrong Current Password

**Setup:**
- User enters incorrect current password

**Expected Results:**
- [ ] Error: "Current password is incorrect"
- [ ] Form not submitted
- [ ] User can retry

---

### Flow 4: Configure Notification Frequency

**Scenario:** User changes notification digest setting

**Steps:**
1. User navigates to Notifications section
2. User selects "Daily Digest" from frequency dropdown
3. Settings save automatically or user clicks save

**Expected Results:**
- [ ] Frequency dropdown shows: Instant, Daily Digest, Weekly Summary
- [ ] Selecting updates the setting
- [ ] Confirmation of change (auto-save indicator or success message)
- [ ] Setting persists on page refresh

---

### Flow 5: Set Quiet Hours

**Scenario:** User configures notification quiet hours

**Steps:**
1. User navigates to Notifications section
2. User enables quiet hours toggle
3. User sets start time (10:00 PM) and end time (8:00 AM)

**Expected Results:**
- [ ] Quiet hours toggle visible
- [ ] Enabling shows time pickers
- [ ] Start and end time selectable
- [ ] Times validated (start before end)
- [ ] Settings save with confirmation

---

### Flow 6: Toggle Notification Types

**Scenario:** User disables approval notifications

**Steps:**
1. User navigates to Notifications section
2. User turns off "Approval Notifications" toggle
3. Settings save

**Expected Results:**
- [ ] Individual toggles for each notification type
- [ ] Types include: Approvals, Submissions, Status Changes, etc.
- [ ] Toggle immediately reflects change
- [ ] Success feedback shown

---

### Flow 7: Change Theme

**Scenario:** User switches to dark mode

**Steps:**
1. User navigates to Preferences section
2. User selects "Dark" from theme dropdown
3. Theme changes

**Expected Results:**
- [ ] Theme dropdown shows: Light, Dark, System
- [ ] Selecting "Dark" applies dark mode immediately
- [ ] "System" follows OS preference
- [ ] Setting persists across sessions

---

### Flow 8: Set Timezone

**Scenario:** User changes timezone

**Steps:**
1. User navigates to Preferences section
2. User selects "Pacific Time (PT)" from timezone dropdown

**Expected Results:**
- [ ] Timezone dropdown with common timezones
- [ ] Shows current selection
- [ ] Selecting updates displayed times across app
- [ ] Confirmation message shown

---

### Flow 9: Configure Default View

**Scenario:** User sets startup screen

**Steps:**
1. User navigates to Preferences section
2. User selects "Competitive Intelligence" as default startup screen

**Expected Results:**
- [ ] Default view dropdown with available sections
- [ ] Options: Dashboard, Search, Watchlists, CI, etc.
- [ ] Selection saved
- [ ] Next login opens to selected view

---

### Flow 10: Log Out

**Scenario:** User logs out of account

**Steps:**
1. User clicks "Log Out" button
2. User confirms logout

**Expected Results:**
- [ ] Log Out button visible (typically at bottom of settings)
- [ ] Confirmation dialog: "Are you sure you want to log out?"
- [ ] Cancel returns to settings
- [ ] Confirm logs out and redirects to login page

---

## Section Navigation Tests

### Tab/Sidebar Navigation

**Scenario:** User navigates between settings sections

**Steps:**
1. User clicks "Notifications" tab/link
2. User clicks "Preferences" tab/link
3. User clicks "Profile" tab/link

**Expected Results:**
- [ ] Three sections clearly labeled: Profile, Notifications, Preferences
- [ ] Clicking switches visible content
- [ ] Active section is highlighted
- [ ] URL may update to reflect section (optional)

---

## Component Tests

### ProfileForm

- [ ] Displays current user name and email
- [ ] Edit mode enables input fields
- [ ] Save button triggers `onSaveProfile`
- [ ] Cancel button reverts changes

### NotificationToggle

- [ ] Shows toggle with label
- [ ] Toggle reflects current state (on/off)
- [ ] Clicking triggers `onToggle` callback
- [ ] Accessible via keyboard

### ThemeSelector

- [ ] Dropdown with Light, Dark, System options
- [ ] Shows current selection
- [ ] Changing triggers `onThemeChange`
- [ ] Applied immediately (preview)

### SettingsSection

- [ ] Header with section title
- [ ] Content area for section items
- [ ] Consistent styling across sections

---

## Edge Cases

- [ ] Handles unsaved changes warning when navigating away
- [ ] Very long usernames truncate appropriately
- [ ] Network error when saving shows retry option
- [ ] Concurrent edits (another device) handled gracefully
- [ ] Password requirements clearly displayed
- [ ] Timezone list is searchable for many options

---

## Sample Test Data

```typescript
const mockUserProfile = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: null
}

const mockNotificationSettings = {
  frequency: 'daily',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  types: {
    approvals: true,
    submissions: true,
    statusChanges: false,
    discontinuations: true
  }
}

const mockPreferences = {
  theme: 'system',
  timezone: 'America/New_York',
  defaultView: 'dashboard'
}
```
