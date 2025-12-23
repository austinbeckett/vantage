export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  role: string
  company: string
  createdAt: string
  lastLogin: string
}

export interface NotificationSettings {
  emailEnabled: boolean
  emailFrequency: 'instant' | 'daily' | 'weekly'
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  notifyOnNewMatch: boolean
  notifyOnStatusChange: boolean
  notifyOnNocIssued: boolean
  notifyOnSafetyUpdate: boolean
  notifyOnWeeklySummary: boolean
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  defaultView: string
  compactMode: boolean
  showDinNumbers: boolean
  dateFormat: string
  startupScreen: string
}

export interface SelectOption {
  id: string
  name: string
  description?: string
  offset?: string
}

export interface SettingsProps {
  userProfile: UserProfile
  notificationSettings: NotificationSettings
  appPreferences: AppPreferences
  frequencyOptions: SelectOption[]
  themeOptions: SelectOption[]
  timezoneOptions: SelectOption[]
  startupScreenOptions: SelectOption[]
  onUpdateProfile?: (profile: Partial<UserProfile>) => void
  onChangePassword?: (currentPassword: string, newPassword: string) => void
  onUpdateNotifications?: (settings: Partial<NotificationSettings>) => void
  onUpdatePreferences?: (preferences: Partial<AppPreferences>) => void
  onLogout?: () => void
}
