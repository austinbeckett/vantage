// =============================================================================
// Data Types
// =============================================================================

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

// =============================================================================
// Component Props
// =============================================================================

export interface SettingsProps {
  /** User profile information */
  userProfile: UserProfile
  /** Notification configuration */
  notificationSettings: NotificationSettings
  /** App display preferences */
  appPreferences: AppPreferences
  /** Available frequency options */
  frequencyOptions: SelectOption[]
  /** Available theme options */
  themeOptions: SelectOption[]
  /** Available timezone options */
  timezoneOptions: SelectOption[]
  /** Available startup screen options */
  startupScreenOptions: SelectOption[]
  /** Called when profile is updated */
  onUpdateProfile?: (profile: Partial<UserProfile>) => void
  /** Called when password change is requested */
  onChangePassword?: (currentPassword: string, newPassword: string) => void
  /** Called when notification settings are updated */
  onUpdateNotifications?: (settings: Partial<NotificationSettings>) => void
  /** Called when app preferences are updated */
  onUpdatePreferences?: (preferences: Partial<AppPreferences>) => void
  /** Called when user logs out */
  onLogout?: () => void
}
