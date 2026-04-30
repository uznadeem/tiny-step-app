'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Preferences = {
  weeklyNudgeEmail: boolean
  confettiOnCompletion: boolean
  soundEffects: boolean
  defaultEnergy: number
}

const DEFAULT_PREFERENCES: Preferences = {
  weeklyNudgeEmail: true,
  confettiOnCompletion: true,
  soundEffects: false,
  defaultEnergy: 3,
}

const ENERGY_OPTIONS = [
  { value: 1, icon: '🪫', label: 'Running on fumes' },
  { value: 2, icon: '😴', label: 'Low but here' },
  { value: 3, icon: '✨', label: 'Medium energy' },
  { value: 4, icon: '⚡', label: 'Feeling good' },
  { value: 5, icon: '🔥', label: 'Hyperfocus mode' },
]

function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== 'object') return DEFAULT_PREFERENCES

  const preferences = value as Partial<Preferences>

  return {
    weeklyNudgeEmail: typeof preferences.weeklyNudgeEmail === 'boolean' ? preferences.weeklyNudgeEmail : DEFAULT_PREFERENCES.weeklyNudgeEmail,
    confettiOnCompletion: typeof preferences.confettiOnCompletion === 'boolean' ? preferences.confettiOnCompletion : DEFAULT_PREFERENCES.confettiOnCompletion,
    soundEffects: typeof preferences.soundEffects === 'boolean' ? preferences.soundEffects : DEFAULT_PREFERENCES.soundEffects,
    defaultEnergy: typeof preferences.defaultEnergy === 'number' ? preferences.defaultEnergy : DEFAULT_PREFERENCES.defaultEnergy,
  }
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('email, display_name, preferences')
        .eq('id', user.id)
        .maybeSingle()

      if (!active) return

      setUserId(user.id)
      setDisplayName(data?.display_name || user.user_metadata?.display_name || '')
      setPreferences(normalizePreferences(data?.preferences))
      setError(profileError ? profileError.message : '')
      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [router])

  const updatePreference = <Key extends keyof Preferences>(key: Key, value: Preferences[Key]) => {
    setPreferences(current => ({ ...current, [key]: value }))
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setMessage('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        preferences,
      })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
    } else {
      setMessage('Preferences saved.')
    }

    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">Loading profile...</div>
      </main>
    )
  }

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <div className="profile-window">
          <aside className="profile-sidebar">
            <Link className="profile-logo" href="/dashboard">tiny<span>step</span></Link>
            <div className="profile-avatar">🌸</div>
            <h1>{displayName || 'Tinystep friend'}</h1>
            <p>⭐ Yearly plan</p>

            <nav className="profile-nav" aria-label="Profile settings">
              <button className="active" type="button"><span>⚙️</span> Preferences</button>
              <button className="logout" type="button" onClick={handleSignOut}><span>🚪</span> Log out</button>
            </nav>
          </aside>

        <section className="profile-content">
          <div className="profile-heading">
            <h2>Your Preferences</h2>
          </div>

          <div className="pref-card">
            <div>
              <strong>Weekly nudge email</strong>
              <p>Sunday reminder to set your intentions.</p>
            </div>
            <button
              className={`pref-toggle${preferences.weeklyNudgeEmail ? ' on' : ''}`}
              type="button"
              onClick={() => updatePreference('weeklyNudgeEmail', !preferences.weeklyNudgeEmail)}
              aria-pressed={preferences.weeklyNudgeEmail}
            />
          </div>

          <div className="pref-card">
            <div>
              <strong>Confetti on completion</strong>
              <p>Celebrate every finished task.</p>
            </div>
            <button
              className={`pref-toggle${preferences.confettiOnCompletion ? ' on' : ''}`}
              type="button"
              onClick={() => updatePreference('confettiOnCompletion', !preferences.confettiOnCompletion)}
              aria-pressed={preferences.confettiOnCompletion}
            />
          </div>

          <div className="pref-card">
            <div>
              <strong>Sound effects</strong>
              <p>Small sounds on checkbox and completion.</p>
            </div>
            <button
              className={`pref-toggle${preferences.soundEffects ? ' on' : ''}`}
              type="button"
              onClick={() => updatePreference('soundEffects', !preferences.soundEffects)}
              aria-pressed={preferences.soundEffects}
            />
          </div>

          <div className="profile-section">
            <h3>Default energy level</h3>
            <div className="energy-preferences">
              {ENERGY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={preferences.defaultEnergy === option.value ? 'selected' : ''}
                  type="button"
                  onClick={() => updatePreference('defaultEnergy', option.value)}
                >
                  <span>{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h3>Account</h3>
            <label className="profile-label" htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              className="profile-input"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
            />
          </div>

          {error && <p className="profile-error">{error}</p>}
          {message && <p className="profile-success">{message}</p>}

          <button className="profile-save" type="button" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button className="profile-delete" type="button">Delete account</button>
        </section>
        </div>
      </section>
    </main>
  )
}
