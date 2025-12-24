import { useState } from 'react'
import {
  User, Bell, Palette, LogOut, Save, Check,
  Moon, Sun, Monitor, Clock, Mail
} from 'lucide-react'
import type {
  SettingsProps,
  UserProfile,
  NotificationSettings,
  AppPreferences
} from '../../types/settings'

type TabId = 'profile' | 'notifications' | 'preferences'

export function Settings({
  userProfile: initialProfile,
  notificationSettings: initialNotifications,
  appPreferences: initialPreferences,
  frequencyOptions,
  timezoneOptions,
  startupScreenOptions,
  onUpdateProfile,
  onChangePassword,
  onUpdateNotifications,
  onUpdatePreferences,
  onLogout
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications)
  const [preferences, setPreferences] = useState<AppPreferences>(initialPreferences)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const tabs = [
    { id: 'profile' as TabId, label: 'Profile', icon: User },
    { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
    { id: 'preferences' as TabId, label: 'Preferences', icon: Palette }
  ]

  const showSaveSuccess = (section: string) => {
    setSaveSuccess(section)
    setTimeout(() => setSaveSuccess(null), 2000)
  }

  const handleSaveProfile = () => {
    onUpdateProfile?.(profile)
    showSaveSuccess('profile')
  }

  const handleSaveNotifications = () => {
    onUpdateNotifications?.(notifications)
    showSaveSuccess('notifications')
  }

  const handleSavePreferences = () => {
    onUpdatePreferences?.(preferences)
    showSaveSuccess('preferences')
  }

  const handleChangePassword = () => {
    if (newPassword === confirmPassword && currentPassword) {
      onChangePassword?.(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showSaveSuccess('password')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                  ${activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Profile Information
                </h2>

                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl font-bold text-primary-700 dark:text-primary-300">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                      Change Avatar
                    </button>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>

                  {/* Role & Company */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Role
                      </label>
                      <input
                        type="text"
                        value={profile.role}
                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Company
                      </label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                    >
                      {saveSuccess === 'profile' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saveSuccess === 'profile' ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Change Password
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white disabled:text-neutral-500 font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-500" />
                  Email Notifications
                </h2>

                <div className="space-y-5">
                  {/* Master toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">Enable Email Notifications</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive updates about your watchlists via email</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, emailEnabled: !notifications.emailEnabled })}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${notifications.emailEnabled ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}
                      `}
                    >
                      <div className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${notifications.emailEnabled ? 'left-7' : 'left-1'}
                      `} />
                    </button>
                  </div>

                  {/* Frequency */}
                  {notifications.emailEnabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Email Frequency
                        </label>
                        <div className="space-y-2">
                          {frequencyOptions.map(option => (
                            <label
                              key={option.id}
                              className={`
                                flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors
                                ${notifications.emailFrequency === option.id
                                  ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                                  : 'bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                }
                              `}
                            >
                              <input
                                type="radio"
                                name="frequency"
                                checked={notifications.emailFrequency === option.id}
                                onChange={() => setNotifications({ ...notifications, emailFrequency: option.id as 'instant' | 'daily' | 'weekly' })}
                                className="sr-only"
                              />
                              <div className={`
                                w-4 h-4 rounded-full border-2 flex items-center justify-center
                                ${notifications.emailFrequency === option.id
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-neutral-300 dark:border-neutral-600'
                                }
                              `}>
                                {notifications.emailFrequency === option.id && (
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">{option.name}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{option.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Quiet Hours */}
                      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-neutral-500" />
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">Quiet Hours</p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, quietHoursEnabled: !notifications.quietHoursEnabled })}
                            className={`
                              relative w-12 h-6 rounded-full transition-colors
                              ${notifications.quietHoursEnabled ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}
                            `}
                          >
                            <div className={`
                              absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                              ${notifications.quietHoursEnabled ? 'left-7' : 'left-1'}
                            `} />
                          </button>
                        </div>
                        {notifications.quietHoursEnabled && (
                          <div className="flex items-center gap-3">
                            <input
                              type="time"
                              value={notifications.quietHoursStart}
                              onChange={(e) => setNotifications({ ...notifications, quietHoursStart: e.target.value })}
                              className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                            />
                            <span className="text-neutral-500">to</span>
                            <input
                              type="time"
                              value={notifications.quietHoursEnd}
                              onChange={(e) => setNotifications({ ...notifications, quietHoursEnd: e.target.value })}
                              className="px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                            />
                          </div>
                        )}
                      </div>

                      {/* Notification Types */}
                      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Notify me about</p>
                        <div className="space-y-3">
                          {[
                            { key: 'notifyOnNewMatch', label: 'New watchlist matches' },
                            { key: 'notifyOnStatusChange', label: 'Product status changes' },
                            { key: 'notifyOnNocIssued', label: 'Notice of Compliance issued' },
                            { key: 'notifyOnSafetyUpdate', label: 'Safety updates (GSUR)' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center justify-between cursor-pointer">
                              <span className="text-neutral-700 dark:text-neutral-300">{item.label}</span>
                              <button
                                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof NotificationSettings] })}
                                className={`
                                  relative w-10 h-5 rounded-full transition-colors
                                  ${notifications[item.key as keyof NotificationSettings] ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}
                                `}
                              >
                                <div className={`
                                  absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform
                                  ${notifications[item.key as keyof NotificationSettings] ? 'left-5' : 'left-0.5'}
                                `} />
                              </button>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Save button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSaveNotifications}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                    >
                      {saveSuccess === 'notifications' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saveSuccess === 'notifications' ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Appearance
                </h2>

                <div className="space-y-4">
                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Theme
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'light', icon: Sun, label: 'Light' },
                        { id: 'dark', icon: Moon, label: 'Dark' },
                        { id: 'system', icon: Monitor, label: 'System' }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => setPreferences({ ...preferences, theme: theme.id as 'light' | 'dark' | 'system' })}
                          className={`
                            flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-colors
                            ${preferences.theme === theme.id
                              ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500'
                              : 'bg-neutral-50 dark:bg-neutral-800 border-2 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700'
                            }
                          `}
                        >
                          <theme.icon className={`w-6 h-6 ${preferences.theme === theme.id ? 'text-primary-500' : 'text-neutral-500'}`} />
                          <span className={`text-sm font-medium ${preferences.theme === theme.id ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-600 dark:text-neutral-400'}`}>
                            {theme.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compact Mode */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">Compact Mode</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Reduce spacing for more content on screen</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, compactMode: !preferences.compactMode })}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${preferences.compactMode ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}
                      `}
                    >
                      <div className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${preferences.compactMode ? 'left-7' : 'left-1'}
                      `} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                  Regional & Display
                </h2>

                <div className="space-y-4">
                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      {timezoneOptions.map(tz => (
                        <option key={tz.id} value={tz.id}>{tz.name} ({tz.offset})</option>
                      ))}
                    </select>
                  </div>

                  {/* Startup Screen */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Startup Screen
                    </label>
                    <select
                      value={preferences.startupScreen}
                      onChange={(e) => setPreferences({ ...preferences, startupScreen: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                    >
                      {startupScreenOptions.map(screen => (
                        <option key={screen.id} value={screen.id}>{screen.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Show DIN Numbers */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">Show DIN Numbers</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Display Drug Identification Numbers in search results</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, showDinNumbers: !preferences.showDinNumbers })}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${preferences.showDinNumbers ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-neutral-600'}
                      `}
                    >
                      <div className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${preferences.showDinNumbers ? 'left-7' : 'left-1'}
                      `} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSavePreferences}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                {saveSuccess === 'preferences' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saveSuccess === 'preferences' ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
