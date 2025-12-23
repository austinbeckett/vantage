import type {
  UserProfile,
  NotificationSettings,
  AppPreferences,
  SelectOption
} from '../types/settings'

export const sampleUserProfile: UserProfile = {
  id: 'user-001',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@vantage.health',
  avatarUrl: null,
  role: 'Regulatory Affairs Manager',
  company: 'Pharma Corp',
  createdAt: '2024-01-15',
  lastLogin: '2024-12-22T09:30:00Z'
}

export const sampleNotificationSettings: NotificationSettings = {
  emailEnabled: true,
  emailFrequency: 'daily',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  notifyOnNewMatch: true,
  notifyOnStatusChange: true,
  notifyOnNocIssued: true,
  notifyOnSafetyUpdate: true,
  notifyOnWeeklySummary: true
}

export const sampleAppPreferences: AppPreferences = {
  theme: 'system',
  timezone: 'America/Toronto',
  defaultView: 'dashboard',
  compactMode: false,
  showDinNumbers: true,
  dateFormat: 'MMM D, YYYY',
  startupScreen: 'dashboard'
}

export const frequencyOptions: SelectOption[] = [
  { id: 'instant', name: 'Instant', description: 'Get notified immediately when changes occur' },
  { id: 'daily', name: 'Daily Digest', description: 'Receive a summary email once per day' },
  { id: 'weekly', name: 'Weekly Summary', description: 'Receive a summary email once per week' }
]

export const themeOptions: SelectOption[] = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'System' }
]

export const timezoneOptions: SelectOption[] = [
  { id: 'America/Vancouver', name: 'Pacific Time (PT)', offset: 'UTC-8' },
  { id: 'America/Edmonton', name: 'Mountain Time (MT)', offset: 'UTC-7' },
  { id: 'America/Toronto', name: 'Eastern Time (ET)', offset: 'UTC-5' },
  { id: 'America/Halifax', name: 'Atlantic Time (AT)', offset: 'UTC-4' },
  { id: 'America/St_Johns', name: 'Newfoundland Time (NT)', offset: 'UTC-3:30' }
]

export const startupScreenOptions: SelectOption[] = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'search', name: 'Search & Discovery' },
  { id: 'watchlists', name: 'Watchlists' }
]
