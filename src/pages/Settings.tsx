import { Settings as SettingsComponent } from '../components/settings'
import {
  sampleUserProfile,
  sampleNotificationSettings,
  sampleAppPreferences,
  frequencyOptions,
  themeOptions,
  timezoneOptions,
  startupScreenOptions
} from '../data/settings-sample'

export default function Settings() {
  const handleUpdateProfile = (profile: Record<string, unknown>) => {
    console.log('Update profile:', profile)
  }

  const handleChangePassword = (currentPassword: string, newPassword: string) => {
    console.log('Change password:', { currentPassword, newPassword })
  }

  const handleUpdateNotifications = (settings: Record<string, unknown>) => {
    console.log('Update notifications:', settings)
  }

  const handleUpdatePreferences = (preferences: Record<string, unknown>) => {
    console.log('Update preferences:', preferences)
  }

  const handleLogout = () => {
    console.log('Logout')
  }

  return (
    <SettingsComponent
      userProfile={sampleUserProfile}
      notificationSettings={sampleNotificationSettings}
      appPreferences={sampleAppPreferences}
      frequencyOptions={frequencyOptions}
      themeOptions={themeOptions}
      timezoneOptions={timezoneOptions}
      startupScreenOptions={startupScreenOptions}
      onUpdateProfile={handleUpdateProfile}
      onChangePassword={handleChangePassword}
      onUpdateNotifications={handleUpdateNotifications}
      onUpdatePreferences={handleUpdatePreferences}
      onLogout={handleLogout}
    />
  )
}
